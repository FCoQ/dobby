var console = require('better-console');
var bot = require('./bot');
var async = require('async');

console.info("Loading configuration...");
require('./config').init(function(config) {

    console.info("Loading plugins...");
    var plugins = require('./plugins').init(config.get("plugins"));

    var supervisor = new bot(config, config.get("bot.name"), 1);

    var watcherName = 0;

    var ctx = {
        watchers: {},
        client_list: {}
    };

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
                        var watcher = new bot(config, "watcher" + watcherName, client.cid);
                        watcherName += 1;

                        ctx.watchers[client.cid] = watcher;

                        watcher.watch_channel(function() {
                            watcher.on_channel_message(function(data) {
                                plugins.onMessage(data.msg, new function() {
                                    this.respond = function(msg, cb) {
                                        supervisor.move_to_channel(client.cid, function(err) {
                                            if (err) {
                                                console.warn("Supervisor couldn't move to channel " + client.cid);
                                                return;
                                            }

                                            supervisor.send_channel_message(msg, function() {
                                                cb()
                                            })
                                        });
                                    }
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