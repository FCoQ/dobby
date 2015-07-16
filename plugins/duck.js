// duckduckgo for dobby!

var unirest = require('unirest');

exports.help = [
    ["!<bang> <terms>", "Use a duckduckgo bang such as !ipt"]
]

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == "!") {
        dobby.respond("[B]Example:[/B] !amazon butt plugs. List of !bangs found [URL=https://duckduckgo.com/bang#bangs-list]here[/URL].");
    } else if (command[0] == "!") {
        unirest.get("http://api.duckduckgo.com/")
            .query({q: command + " " + terms, format: "json",no_html: 1, no_redirect: 1})
            .end(function(response) {
                if (response.status == 200) {
                    var body = JSON.parse(response.body);
                    if (body){
                        var first = body;
                        if (!first.Redirect){
                            dobby.respond("[B]Example:[/B] !amazon butt plugs. List of !bangs found [URL=https://duckduckgo.com/bang#bangs-list]here[/URL].");
                        } else {
                            if (typeof first != "undefined") {
                                dobby.respond("[URL]" + first.Redirect + "[/URL]");
                            } else {
                                dobby.respond("No results.");
                            }
                        }
                    } else {
                        dobby.respond("No response.");
                    }
                } else {
                    dobby.respond("Failed!");
                }
            })
    }
}


