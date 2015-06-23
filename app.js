require('./config').init(function(config) {
    console.log(config.get("bot.name"));
})