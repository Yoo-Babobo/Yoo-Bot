$(() => {
    $("#start").on("click", start);
    $("#stop").on("click", stop);

    $("#name").on("input", () => fs.writeFile("./app-data/name.dat", $("#name").val(), err => { if (err) return; }));
    $("#prefix").on("input", () => fs.writeFile("./app-data/prefix.dat", $("#prefix").val(), err => { if (err) return; }));
    $("#invite").on("input", () => fs.writeFile("./app-data/invite.dat", $("#invite").val(), err => { if (err) return; }));
    $("#token").on("input", () => fs.writeFile("./app-data/token.dat", $("#token").val(), err => { if (err) return; }));
});

var online = false;

function start() {
    if (!online) {
        try {
            bot.start($("#name").val(), $("#prefix").val(), $("#invite").val(), $("#token").val());
            delete require.cache[require.resolve("../bot/bot.js")];
            bot = require("../bot/bot.js");
            notification("Info", "Bot started!");
            $("#start").text("Restart")
                .attr("aria-label", "Restart The Bot")
                .css({"backgroundColor": "#5865f2", "color": "#d3d3d3"});
            online = true;
        } catch { notification("Error", "An error occurred while starting the bot."); }
    } else {
        try {
            bot.stop();
            delete require.cache[require.resolve("../bot/bot.js")];
            bot = require("../bot/bot.js");
            setTimeout(() => {
                bot.start($("#name").val(), $("#prefix").val(), $("#invite").val(), $("#token").val());
                notification("Info", "Bot restarted!");
            }, 500);
        } catch { notification("Error", "An error occurred while restarting the bot."); }
    }
}

function stop() {
    try {
        bot.stop();
        delete require.cache[require.resolve("../bot/bot.js")];
        bot = require("../bot/bot.js");
        notification("Info", "Bot stopped!");
            $("#start").text("Start")
                .attr("aria-label", "Start The Bot")
                .css({"backgroundColor": "#57f287", "color": "#343434"});
        online = false;
    } catch { notification("Error", "An error occurred while stopping the bot."); }
}