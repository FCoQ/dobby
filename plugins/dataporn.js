// random dataporn pic from reddit

var unirest = require('unirest');

exports.help = [
    [".dataporn", "Random stimulating image from reddit"]
]

exports.onMessage = function(msg, dobby) {

    if (msg == '.dataporn') {
        unirest.get("https://www.reddit.com/r/dataisbeautiful/top/.json")
            .query({})
            .end(function(response) {
                if (response.status == 200) {
                    var body = response.body;
                    if (body){
                        var first = body.data.children[Math.floor(Math.random() * body.data.children.length)].data;
                        if (typeof first != "undefined") {
                            dobby.respond("[URL="+ first.url +"]" + first.title +"[/URL]");
                        } else {
                            dobby.respond("No results.");
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


