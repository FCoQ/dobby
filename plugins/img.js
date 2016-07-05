// img plugin for Dobby
var gis = require('g-i-s');

exports.help = [
    [".img <terms>", "Search for an image on Google"]
];

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.img') {
        gis(terms, logResults);

        function logResults(error, results){
            if (error){
                dobby.respond('Error: '+ error);
            } else {
                if(typeof results[0] == 'undefined'){
                    dobby.respond('No results!');
                } else {
                    dobby.respond('[url]' + JSON.stringify(results[0].url).replace(/\"/g, "") + '[/url]');
                }
            }
        }
    }
};


