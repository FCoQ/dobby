var console = require('better-console');
var bot = require('./bot');

console.info("Loading configuration...");
require('./config').init(function(config) {

    console.info("Loading plugins...");
    var plugins = require('./plugins').init(config.get("plugins"));

    var supervisor = new bot(config);
    supervisor.send("clientlist", null, function(err, response) {
    	console.log(response);
    });
})