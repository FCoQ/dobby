var console = require('better-console');

console.info("Loading configuration...");
require('./config').init(function(config) {
    var supervisor_name = config.get("bot.name");
    var ts3_host = config.get("server.host");
    var ts3_user = config.get("server.user");
    var ts3_pass = config.get("server.pass");

    
})