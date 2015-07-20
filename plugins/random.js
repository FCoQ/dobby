// random integer plugin

exports.help = [
    [".random <min>-<max>", "Generate random integer between an interval"]
]

exports.onMessage = function(msg, dobby) {
    var s = /^\.rand(om)? ([0-9]{1,6})-([0-9]{1,6})/.exec(msg);
    if (s) {
        var min = parseInt(s[2]);
        var max = parseInt(s[3]);
        var math = (min + Math.floor(Math.random() * ((max - min) + 1)))
        dobby.respond(math)
    }
}