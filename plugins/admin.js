// admin tools

var async = require('async');

exports.onMessage = function(msg, dobby) {
	var terms = msg.split(" ");
    var command = terms.shift();

    if (command == ".admin") {
    	dobby.client_from.is_admin(function(err, is_admin) {
    		if (is_admin) {
    			dobby.respond("Not finished.");
    			return;

    			var subcommand = terms.shift();

		    	if (subcommand == "add") {
		    		dobby.find_clients(terms.join(" "), function(err, clients) {
		    			if (err) {
		    				dobby.respond("Couldn't fetch user list for some reason.")
		    			} else {
		    				if (clients.length == 1) {
		    					clients[0].private_message("I'll be adding you to the admin list (not actually lol)");
		    				} else if (clients.length == 0) {
		    					dobby.respond("No users match that name.");
		    				} else {
		    					dobby.respond("Ambiguous username!");
		    				}
		    			}
		    		})
		    	}
    		} else {
    			dobby.respond("You're not an admin.")
    			return;
    		}
    	})
    }
}