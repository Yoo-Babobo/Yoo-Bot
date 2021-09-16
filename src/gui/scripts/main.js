$(() => {
    $("#start").on("click", start);
    $("#stop").on("click", stop);

    $("#name").on("input", () => fs.writeFile("./app-data/bots/discord/" + id + "/name.dat", $("#name").val(), err => { if (err) return; }));
    $("#prefixes").on("input", () => fs.writeFile("./app-data/bots/discord/" + id + "/prefixes.dat", $("#prefixes").val(), err => { if (err) return; }));
    $("#owners").on("input", () => fs.writeFile("./app-data/bots/discord/" + id + "/owners.dat", $("#owners").val(), err => { if (err) return; }));
    $("#invite").on("input", () => fs.writeFile("./app-data/bots/discord/" + id + "/invite.dat", $("#invite").val(), err => { if (err) return; }));
    $("#token").on("input", () => fs.writeFile("./app-data/bots/discord/" + id + "/token.dat", $("#token").val(), err => { if (err) return; }));
});

var online = false;

function start() {
    if (!online) {
        try {
            bot.start(id, $("#name").val(), $("#prefixes").val(), $("#owners").val(), $("#invite").val(), $("#token").val());
            notification("Info", "Bot started!");
            $("#start").text("Restart")
                .attr("aria-label", "Restart The Bot")
                .css({"backgroundColor": "#5865f2", "color": "#d3d3d3"});
            online = true;
        } catch (err) { notification("Error", "An error occurred while starting the bot. " + err); }
    } else {
        try {
            // bot.restart($("#name").val(), $("#prefixes").val(), $("#owners").val(), $("#invite").val(), $("#token").val());
            bot.stop();
            delete require.cache[require.resolve("../bot/discord/bot.js")];
            bot = require("../bot/discord/bot.js");
            bot.start(id, $("#name").val(), $("#prefixes").val(), $("#owners").val(), $("#invite").val(), $("#token").val());
            notification("Info", "Bot restarted!");
        } catch (err) { notification("Error", "An error occurred while restarting the bot. " + err); }
    }
}

function stop() {
    ipcRenderer.send("reload");
    /*try {
        bot.stop();
        delete require.cache[require.resolve("../bot/discord/bot.js")];
        bot = require("../bot/discord/bot.js");
        notification("Info", "Bot stopped!");
            $("#start").text("Start")
                .attr("aria-label", "Start The Bot")
                .css({"backgroundColor": "#57f287", "color": "#343434"});
        online = false;
    } catch (err) { notification("Error", "An error occurred while stopping the bot. " + err); }*/
}