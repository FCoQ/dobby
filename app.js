var console = require('better-console');

console.info("Loading configuration...");
require('./config').init(function(config) {

    console.info("Loading plugins...");
    var plugins = require('./plugins').init(config.get("plugins"));

    plugins.onMessage("test");
})