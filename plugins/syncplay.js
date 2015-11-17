var net = require('net');
var async = require('async');

var ip = '';
var port = '';
var roomName = '';
var chanID = '';


exports.config = function(config){
    ip = config.ip;
    port = config.port;
    roomName = config.roomName;
    chanID = config.chanID;
};


function getName(request, cb){
    var con = new net.Socket();
    con.connect(port, ip, function(){
        con.write(request + '\r\n')
    });
    con.on('data', function(data){
        con.destroy();
        var preParsed = (data + '').split(/\r\n|\r|\n/g);
        var parsed = JSON.parse(preParsed[1]);
        for(username in parsed['List'][roomName]){
            if (parsed['List'][roomName].hasOwnProperty(username)){
                if (typeof parsed['List'][roomName][username]['file']['name'] != 'undefined'){
                    var prettyName = (parsed['List'][roomName][username]['file']['name']).substring(0,31);
                    var prettierName = (/.+?(?=.720p|.1080p)/.exec(prettyName));
                    return cb(null, prettierName || prettyName);
                }
            }
        }
        cb("couldn't get syncplay data")
    });
    con.on('error', function(err){
        console.log('syncplay error: ' + err);
        cb("connection error")
    });
}

exports.init = function(dobby){
    async.forever(function(next){
        setTimeout(function(){
            getName(JSON.stringify({'List': null}), function(err, newTitle){
                if (!err){
                    dobby.send("channeledit", {cid: chanID, channel_name: 'Theatre: ' + newTitle}, function(err) {
                        if (err) {
                            //console.warn("error editing channel: " + JSON.stringify(err));
                            next()
                        } else {
                            //console.log("success");
                            next()
                        }
                    });
                } else {
                    next()
                }
            });
        }, 5000)
    })
};
