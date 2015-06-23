var fs   = require('fs'),
    toml = require('toml'),
    console = require('better-console');

// load the configuration file
exports.init = function(cb) {
    fs.readFile("config.toml", function(err, config) {
        if (err) {
            console.error("Error reading configuration file: " + err);
        } else {
            config = toml.parse(config);

            var new_config = {
                _config: config,
                get: function(field) {
                    var obj = this._config;
                    var prop, props = field.split('.');

                    for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
                        prop = props[i];

                        var candidate = obj[prop];
                        if (candidate !== undefined) {
                            obj = candidate;
                        } else {
                            break;
                        }
                    }
                    return obj[props[i]];
                }
            };

            cb(new_config);
        }
    })
}
