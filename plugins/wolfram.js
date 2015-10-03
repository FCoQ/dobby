var fs = require('fs');
var unirest = require('unirest');
var parseString = require('xml2js').parseString;
var key = "";

exports.config = function(config){
    key = config.key
};

exports.help = [
    [".wa[ <terms>]", "Full access to Wolfram API. "]
]

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.wa' || command == '.calc'){
        unirest.get('https://api.wolframalpha.com/v2/query')
            .query({input: terms, appid: key})
            .end(function(response){
                if (response.status == 200){
                    dobby.respond('Successfully got teh data from teh wolfie')
                    var xml = response.body;
                    parseString(xml, function(err, result){

                        fs.writeFile('json.out', JSON.stringify(result), function (err) {
                            if (err) return console.log(err)
                        })
                        console.log('outputted in teh file pls')

                        if ((result['queryresult']['$']['success']) == "true"){
                            var printed = false;
                            result['queryresult']['pod'].forEach(function(pod, i) {
                                if (i == 1 || pod['$']['title'] == "Decimal approximation"){
                                    if (typeof pod['subpod'][0]['plaintext'][0] == "string"){
                                        dobby.respond(pod['subpod'][0]['plaintext'][0])
                                        if (typeof pod['subpod'][0]['img'][0]['$']['src'] == 'string') {
                                            dobby.respond('[URL]' + pod['subpod'][0]['img'][0]['$']['src'] + '[/URL]')
                                        }
                                        printed = true
                                    }
                                }
                            });
                            if (!printed){
                                dobby.respond("Couldn't represent result as plaintext.");
                            }
                            //dobby.respond(JSON.stringify(result['queryresult']['pod'][0]['subpod'][0]['plaintext'][0]));
                        } else {
                            dobby.respond('Invalid query')
                        }

                    });

                } else {
                    dobby.respond('No response')
                }
            })
    }
}