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

function parse(input){
    var render = {text: "", img: ""}
    for(var a=0; a<input.queryresult.pod.length; a++)
    {
        var pod = input.queryresult.pod[a]

        if (a == 1 || pod.$.title == "Decimal approximation" || pod.$.primary == "true" || pod.$.title == "Plot"){
            for(var b=0; b<pod.subpod.length; b++)
            {
                var subpod = pod.subpod[b];
                for(var c=0; c<subpod.img.length; c++)
                {
                    var text = subpod.img[c];
                    render.img = text.$.src;
                }
                for(var d=0; d<subpod.plaintext.length; d++)
                {
                    var text = subpod.plaintext[d];
                    render.text = text;
                }
            }
        }
    }
    return render
}

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.wa' || command == '.calc'){
            if (dobby.cache.has("wolfram:" + terms)){
                //db has terms already stored, eventually do something here
                console.log('has terms')
                var result = dobby.cache.get("wolfram:" + terms)
                var render = parse(result)

                dobby.respond(render.text + " [b][url=" +  render.img + "]image[/url][/b]")

            } else {
                unirest.get('https://api.wolframalpha.com/v2/query')
                    .query({input: terms, appid: key})
                    .end(function(response){
                        if (response.status == 200){
                            var xml = response.body;
                            parseString(xml, function(err, result){
                                fs.writeFile('json.out', '', function(){console.log('done')})
                                fs.writeFile('json.out', JSON.stringify(result), function (err) {
                                    if (err) return console.log(err)
                                })
                            if((result['queryresult']['$']['success']) == "true"){
                                dobby.cache.put("wolfram:" + terms, result)
                                var render = parse(result)
                                dobby.respond(render.text + " [b][url=" +  render.img + "]image[/url][/b]")


                            }
                            });

                        } else {
                            dobby.respond('No response')
                        }
                    })
            }


    }
}