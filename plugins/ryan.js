// name generator for ryan
var adjs = ["pwner", "owner", "killer", "master", "murder", "boss", "rude", "tricky", "silent",
    "god", "asskicker", "greenbay", "lord", "king", "knight", "dark", "darth", "swag", "iphone", "gamer",
    "hardcore", "prince", "whitewolf", "wolf", "thunderdog", "vampire", "ninja", "dragon"];
var names = ["ryan", "james", "jack", "oliver", "jacob", "william", "travis", "charlie", "harry", "jordan", "george", "freddie", "logan", "john",
            "sasuke", "ryu", "ken", "tim", "brenda"];
var numbers = ["08", "07", "00", 2008, 2004, 2003, "03", "04", "02", "2002", "2010", "10", 13, 12, 11, 123];

exports.onMessage = function(msg, dobby) {

    if (msg == '.ryan') {
        var adj = adjs[Math.floor(Math.random()*adjs.length)];
        var name = names[Math.floor(Math.random()*names.length)];
        var number = numbers[Math.floor(Math.random()*numbers.length)];
        var gamer = adj + name + number;
        dobby.respond("Gamer: " + "[b]" + gamer + "[/b]");
    }
}