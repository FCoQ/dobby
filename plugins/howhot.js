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

exports.help = [
    [".howhot[ <username>]", "Get the temperature where you live (based on IP) or of another user"]
]

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.howhot') {
        async.waterfall([
           function(cb){
               if(terms.length > 0){
                   dobby.find_clients(terms, function(err, clients){
                       if(err){
                           cb(err)
                       }else{
                           if(clients.length == 1){
                               cb(null, clients[0])
                           }else if(clients.length == 0){
                               dobby.respond("Couldn't find that user!")
                           }else{
                               dobby.respond("More than one user fits this criteria!")
                           }
                       }
                   })
               }else{
                   cb(null, dobby.client_from)
               }
           },
           function(client, cb){
             client.get_ip( function(err, ip){
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
