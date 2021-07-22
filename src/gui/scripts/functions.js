const { ipcRenderer } = require("electron");

$(() => {
    $("input, button, a").prop("tabIndex", -1);
    $("button").on("focus", () => $("button").trigger("blur"));

    fs.readFile("app-data/name.dat", "utf8" , (err, data) => {
        if (err) return;
        $("#name").val(data.toString());
    });

    fs.readFile("app-data/prefix.dat", "utf8" , (err, data) => {
        if (err) return;
        $("#prefix").val(data.toString());
    });

    fs.readFile("app-data/invite.dat", "utf8" , (err, data) => {
        if (err) return;
        $("#invite").val(data.toString());
    });

    fs.readFile("app-data/token.dat", "utf8" , (err, data) => {
        if (err) return;
        $("#token").val(data.toString());
    });

    setInterval(() => {
        create_if_not_exist_dir("./app-data");
        create_if_not_exist_dir("./app-data/commands");
        create_if_not_exist_dir("./app-data/events");
        create_if_not_exist("./app-data/name.dat");
        create_if_not_exist("./app-data/prefix.dat");
        create_if_not_exist("./app-data/invite.dat");
        create_if_not_exist("./app-data/token.dat");
        create_if_not_exist("./app-data/functions.js", `module.exports = {
    message_events: (message, client) => {
        switch (message.content) {
            
        }
    }
}`);
        create_if_not_exist("./app-data/config.json", `{
    "statuses": [
        {
            "name": "{{prefix}}help",
            "type": "PLAYING"
        }
    ],

    "help_command": "",
    "help_command_categories": "",
    "help_command_commands": "",
    "help_command_embed_color": "RANDOM",
    "help_command_enabled": true,

    "ping_command": "Pong! :ping_pong:\nLatency is {{latency}}ms. API Latency is {{api_latency}}ms.",
    "ping_command_embed_color": "RANDOM",
    "ping_command_enabled": true,

    "invite_command": "Invite me to your server! [Click Here]({{link}})",
    "invite_command_embed_color": "RANDOM",
    "invite_command_enabled": true
}`);
    }, 20);
});

function create_if_not_exist(file, content = "") {
    fs.access(file, fs.F_OK, err => {
        if (err) {
            fs.writeFile(file, content, err => { if (err) return; });
            return;
        };
    });
}

function create_if_not_exist_dir(dir) {
    fs.access(dir, fs.F_OK, err => {
        if (err) {
            fs.mkdir(dir, err => { if (err) return; });
            return;
        };
    });
}

function rnd(len) {
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].map(() => str.charAt(Math.floor(Math.random() * str.length))).toString().replace(/,/g, "");
}

function notification(title, message, button2_enabled = false, button2_text = null, button2 = () => {}) {
    var stopped = false;

    $("#notification-title").text(title);
    $("#notification-message").text(message);

    $("#notification-button1").on("click", () => {
        hide_notification();
        stopped = true;
    });

    if (button2_enabled) {
        $("#notification-button2").text(button2_text);
        $("#notification-button2").show();
        $("#notification-button2").on("click", button2);
    }

    $("#notification").css("opacity", 1);
    $("#notification").css("height", "33%");

    setTimeout(() => { if (!stopped) hide_notification(); }, 2500);
}

function hide_notification() {
    $("#notification").css("opacity", 0);
    $("#notification").css("height", "0%");

    setTimeout(() => $("#notification-button2").hide(), 500);
}

ipcRenderer.send("app-version");
ipcRenderer.on("app-version", (event, data) => {
    ipcRenderer.removeAllListeners("app-version");
    $("#version").text(data.version);
});

ipcRenderer.on("update_available", () => {
    ipcRenderer.removeAllListeners("update_available");
    notification("Update", "A new update is available. Downloading now...");
});
ipcRenderer.on("update_downloaded", () => {
    ipcRenderer.removeAllListeners("update_downloaded");
    notification("Update", "Update Downloaded. It will be installed on restart. Restart now?", true, "Restart", () => ipcRenderer.send("restart"));
});