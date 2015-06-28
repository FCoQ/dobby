var console = require('better-console');
var bot = require('./bot');
var async = require('async');

console.info("Loading configuration...");
require('./config').init(function(config) {

    console.info("Loading plugins...");
    var plugins = require('./plugins').init(config.get("plugins"));

    var supervisor = new bot(config, "Dobby", 3);

    supervisor.send_channel_message("testing one", function() {
        supervisor.send_channel_message("testing two", function() {
            supervisor.change_username("AlsoDobby", function() {
                supervisor.send_channel_message("testing THREE", function() {
                    console.log("done");
                })
            })
        })
    })
})