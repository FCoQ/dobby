var console = require('better-console');
var bot = require('./bot');
var async = require('async');
var cache = require('flat-file-db')("./dobby.db");

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 12; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

console.info("Loading configuration...");
require('./config').init(function(config) {

    console.info("Loading plugins...");
    var plugins = require('./plugins').init(config.get("plugins"));

    var default_channel_id = 1;
    if (config.get("server.cid") != undefined) {
        default_channel_id = config.get("server.cid");
    }

    var supervisor = new bot(config, config.get("bot.name"), default_channel_id);

    cache.on('open', function() {
        var ctx = {
            watchers: {},
            client_list: {}
        };

        var Client = function(clid, name) {
            var clientInfo = {client_nickname: name};
            var disableUpdate = false;

            this.disable_updates = function() {
                disableUpdate = true;
            }

            this.private_message = function(contents, cb) {
                if (!cb) {
                    cb = function() {}
                }
                supervisor.send_private_message(clid, contents, cb);
            }

            this.is_admin = function(cb) {
                this.get_uid(function(err, uid) {
                    if (err) {
                        cb(err)
                    } else {
                        var admins = config.get("admins");

                        if (typeof admins == "object") {
                            for (name in admins) {
                                if (admins[name] == uid) {
                                    cb(null, true)
                                    return;
                                }
                            }
                            cb(null, false);
                        } else {
                            console.log("No admins are defined in the config file.");
                            cb(null, false);
                        }
                    }
                })
            }

            this.get_name = function(cb){
                cb(null, clientInfo.client_nickname)
            }

            this.get_cid = function(cb) {
                this.update(function(err) {
                    cb(err, clientInfo.cid)
                })
            }

            this.get_clid = function(cb) {
                cb(null, clid)
            }

            this.get_ip = function(cb) {
                this.update(function(err) {
                    cb(err, clientInfo.connection_client_ip)
                })
            }

            this.get_uid = function(cb) {
                this.update(function(err) {
                    cb(err, clientInfo.client_unique_identifier)
                })
            }

            this.update = function(cb) {
                if (disableUpdate) {
                    cb(null)
                } else {
                    supervisor.get_client_info(clid, function(err, response) {
                        if (err) {
                            clientInfo = {}
                            cb(err)
                        } else {
                            clientInfo = response;
                            cb(null)
                        }
                    })
                }
            }
        };

        var generic_helpers = {
            cache: cache,
            send: function(cmd, options, cb) {
                supervisor.send(cmd, options, cb);
            },
            help_message: function() {
                return plugins.getHelpMessage();
            },
            server_info: function(cb) {
                supervisor.get_server_info(cb)
            },
            client_list: function(cb) {
                supervisor.get_client_list(function(err, response) {
                    if (err) {
                        cb(err)
                    } else {
                        cb(err, response.filter(function(client) {
                            return client.client_type == 0
                        }).map(function(client) {
                            return new Client(client.clid, client.client_nickname)
                        }))
                    }
                })
            },
            find_clients: function(partial, cb) {
                this.client_list( function(err, clients){
                    if(err){
                        cb(err)
                    }else{
                        async.filter(clients, function(client, cb){
                            client.get_name( function(err, name){
                                if(err) {
                                    cb(false)
                                }else{
                                    if(name.toString().toLowerCase().match(partial.toLowerCase())){
                                        cb(true)
                                    }else{
                                        cb(false)
                                    }
                                }
                            })
                        }, function(clients){
                            cb(null, clients)
                        })
                    }
                })
            }
        };

        plugins.startPlugins(generic_helpers);

        async.forever(function(next) {
            supervisor.send("clientlist", function(err, response) {
                if (err) {
                    console.warn("Couldn't receive client list!");
                    next();
                    return;
                }

                ctx.client_list = response;

                var unseenMap = {};
                for (cid in ctx.watchers) {
                    unseenMap[cid] = true;
                }

                async.eachSeries(ctx.client_list, function(client, cb) {
                    if (client.client_type == 0) {
                        delete unseenMap[client.cid];

                        if (typeof ctx.watchers[client.cid] == "undefined") {
                            // create a watcher

                            console.info("Creating new watcher for channel " + client.cid);
                            var watcher = new bot(config, makeid(), client.cid);

                            ctx.watchers[client.cid] = watcher;

                            watcher.watch_channel(function() {
                                watcher.on_channel_message(function(data) {
                                    plugins.onMessage(String(data.msg), new function() {
                                        this.cid = client.cid;
                                        this.client_from = new Client(data.invokerid, data.invokername);

                                        this.respond = function(msg, cb) {
                                            if (msg.length >= 500) {
                                                msg = msg.substr(0, 500) + "[...]";
                                            }

                                            supervisor.move_to_channel(client.cid, function(err) {
                                                if (err) {
                                                    console.warn("Supervisor couldn't move to channel " + client.cid);
                                                    return;
                                                }

                                                supervisor.send_channel_message(msg, function() {
                                                    if (cb) {
                                                        cb()
                                                    }
                                                })
                                            });
                                        }

                                        this.client_list = generic_helpers.client_list;
                                        this.find_clients = generic_helpers.find_clients;
                                        this.help_message = generic_helpers.help_message;
                                        this.cache = generic_helpers.cache;
                                        this.send = generic_helpers.send;
                                    });
                                });
                                cb();
                            })
                        } else {
                            cb();
                        }
                    } else {
                        cb();
                    }
                }, function() {
                    for (var defunctChannel in unseenMap) {
                        if (unseenMap.hasOwnProperty(defunctChannel)) {
                            console.info("Watcher for channel " + defunctChannel + " no longer needed, closing");
                            ctx.watchers[defunctChannel].close();

                            delete ctx.watchers[defunctChannel];
                        }
                    }

                    next();
                })
            })
        }, function(err) {

        });
    })
})
