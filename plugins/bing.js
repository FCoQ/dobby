// bing dictionary plugin for Dobby

var unirest = require('unirest');
var fs = require('fs');

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.bing') {
        unirest.get("https://www.bing.com/images/async")
            .query({q: terms, async: "content", first: "1", adlt: "off"})
            .end(function(response) {
                if (response.status == 200) {
                    var first = /imgurl:&quot;(.*?)&quot;/.exec(response.body);
                    if (first) {
                        dobby.respond("[B]NSFW![/B] [URL]" + first[1] + "[/URL]");
                    } else {
                    }
                } else {
                    dobby.respond("Failed!");
                }
            })
    }
}

