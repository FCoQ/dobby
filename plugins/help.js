exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    terms = terms.join(" ");

    if (command == '.help') {
        dobby.respond("\n" + dobby.help_message())
    }
}