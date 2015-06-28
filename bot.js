// This is a thin wrapper around node-teamspeak which automatically reconnects
// when there is a socket event, and handles closing and dispatching
// appropriately as a result.

var console = require('better-console');
var ts3 = require('node-teamspeak');

function connect(ctx, config) {
    ctx.restarted = false;

    ctx.cl = new ts3(config.get("server.host"), config.get("server.port"));

    ctx.cl.on('connect', function() {
        ctx.cl.send("login",
                    {client_login_name: config.get("server.user"), client_login_password: config.get("server.pass")},
                    function(err, response) {
                        if (err) {
                            console.warn("server query login failure");
                            ctx.cl.close();
                            return;
                        }
                        ctx.cl.send("use", {sid: 1}, function(err, response) {
                            if (err) {
                                console.warn("couldn't select virtual server 1");
                                ctx.cl.close();
                                return;
                            }
                            ctx.cl.send("clientupdate", {client_nickname: ctx.username}, function(err, response) {
                                if (err) {
                                    console.warn("couldn't update nickname to " + ctx.username);
                                    ctx.cl.close();
                                    return;
                                }
                                ctx.cl.send("whoami", {}, function(err, response) {
                                    if (err) {
                                        console.warn("'whoami' command failed");
                                        ctx.cl.close();
                                        return;
                                    }
                                    ctx.clid = response.client_id;

                                    ctx.cl.send("clientmove", {clid: ctx.clid, cid: ctx.cid}, function(err, response) {
                                        ctx.ready = true;
                                    })
                                })
                            })
                        })
                    }
        );
    });

    ctx.cl.on('close', function() {
        ctx.ready = false;
        if (ctx.enabled && !ctx.restarted) {
            console.warn("socket error, reconnecting..");
            ctx.restarted = true;
            setTimeout(function() {
                connect(ctx, config);
            }, 5000);
        }
    })

    ctx.cl.on('error', function() {
        ctx.ready = false;
        if (ctx.enabled && !ctx.restarted) {
            console.warn("connection closed, reconnecting..");
            ctx.restarted = true;
            setTimeout(function() {
                connect(ctx, config);
            }, 5000);
        }
    })

    ctx.cl.on('textmessage', function(data) {
        ctx.on_channel_message(data);
    })
}

module.exports = function TS3Bot(config, username, cid) {
    var ctx = {
        cl: null,
        enabled: true,
        restarted: false,
        ready: false,
        username: username,
        cid: cid,
        clid: 0,
        on_channel_message: function() {}
    };

    connect(ctx, config);

    this.close = function() {
        ctx.enabled = false;

        if (ctx.cl) {
            ctx.cl.close();
        }
    }

    this.on_channel_message = function(cb) {
        ctx.on_channel_message = cb;
    }

    this.send = function(cmd, options, cb) {
        if (ctx.ready && ctx.cl) {
            ctx.cl.send(cmd, options, cb);
        } else {
            var self = this;
            setTimeout(function() {
                self.send(cmd, options, cb);
            }, 1000);
        }
    }

    this.move_to_channel = function(cid, cb) {
        ctx.cid = cid;

        this.send("clientmove", {clid: ctx.clid, cid: ctx.cid}, function(err, response) {
            cb(err);
        })
    }

    this.change_username = function(name, cb) {
        ctx.username = name;

        this.send("clientupdate", {client_nickname: ctx.username}, function(err, response) {
            cb(err);
        })
    }

    this.send_channel_message = function(msg, cb) {
        this.send("sendtextmessage", {targetmode: 2, msg: msg}, function(err) {
            cb(err);
        })
    }

    this.watch_channel = function(cb) {
        this.send("servernotifyregister", {event: "textchannel", id: ctx.cid}, function(err) {
            cb(err);
        })
    }
}