// urban dictionary plugin for Dobby

exports.onMessage = function(msg) {
	console.log("ud: got a message! " + JSON.stringify(msg));
}