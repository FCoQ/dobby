var toml = require('toml'),
    fs   = require('fs');

// load the configuration file
fs.readFile("config.toml", function(err, config) {
    if (err) {
        console.log("Error reading configuration file: " + err);
    } else {
        config = toml.parse(config);

        console.log(config);
    }
})