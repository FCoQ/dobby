// channelid plugin for Dobby

exports.onMessage = function(msg, dobby) {

    if (msg == '.cid') {
        dobby.respond(dobby.cid)
    }
}