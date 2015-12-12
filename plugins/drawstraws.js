// draw straws plugin for dobbeh

exports.help = [
    [".drawstraws <name1> <name2>", "Picks a random name from the input"]
];

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();

    if (command == '.drawstraws') {
        if (terms.length != -1) {
            var winner = terms[Math.floor(Math.random() * terms.length)];
            if (typeof winner == 'undefined') {
                dobby.respond("[b]Invalid input:[/b] .drawstraws name1 name2 name3")
            } else {
                dobby.respond('Winner: ' + '[b]' + winner + '[/b]')
            }
        }
    }
};


