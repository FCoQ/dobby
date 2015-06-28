// urban dictionary plugin for Dobby

var unirest = require('unirest');


exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.ud') {
        unirest.get("http://api.urbandictionary.com/v0/define")
            .query({term: terms})
            .end(function(response) {
                if (response.status == 200) {
                    var first = response.body.list[0];
                    if (typeof first != "undefined") {
                        dobby.respond("[B]Urban Dictionary:[/B] " + first.definition);
                    } else {
                        dobby.respond("No results.");
                    }
                } else {
                    dobby.respond("Failed!");
                }
            })
    }
}

