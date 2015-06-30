// outside temperature plugin for Dobby

var async = require('async');
var unirest = require('unirest');
var key = "";

function to_c(f){
    return (f - 32) * (5 / 9)
}

exports.config = function(config){
    key = config.key
};

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    //terms = terms.join(" ");

    if (command == '.howhot') {
        async.waterfall([
           function(cb){
               dobby.client_from().get_ip(function(err, ip){
                   if(!err){
                       unirest.get("http://api.ipinfodb.com/v3/ip-city/")
                           .query({key: key, ip: ip, format: "json"})
                           .end(function(response) {
                               if (response.status == 200) {
                                   cb(null, {zip: response.body.zipCode, country: response.body.countryCode})
                               } else {
                                   cb("Couldn't find ip!");
                               }
                           })
                   } else {
                       cb(err)
                   }
               })
           },
           function(location, cb){
               unirest.get("http://api.openweathermap.org/data/2.5/weather")
                   .query({zip: location.zip + "," + location.country, units: "imperial"})
                   .end(function(response){
                       if (response.status == 200) {
                           cb(null, response.body.main.temp.toFixed(0) + "F, " + to_c(response.body.main.temp).toFixed(2) + "C")
                       } else {
                           cb("Couldn't find weather!")
                       }
                   })
           }
        ], function(err, temp){
            dobby.respond(temp)
        });
    }
};
