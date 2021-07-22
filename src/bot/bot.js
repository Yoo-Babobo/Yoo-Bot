const Discord = require("discord.js");
const client = new Discord.Client();
const functions = require("../../app-data/functions");

var name;
var prefixes;
var invite;

client.once("Ready", () => {
	console.info("Logged in as " + client.user.username);
});

client.on("ready", () => {
	client.user.setActivity("aaa", {
		type: "COMPETING"
	});
})

client.on("message", (message) => {
	functions.message_events(message, client);

	let prefix = false;
	for (const thisPrefix of prefixes) if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
	if (!prefix || message.author.bot) return;
	
	const raw_args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = raw_args.shift().toLowerCase();
	const args = raw_args.slice(0);
	let embed;

	if (command === "help") {
		message.reply("lel");
	} else if (command === "ping") {
		if (config().ping_command_enabled) {
			embed = new Discord.MessageEmbed()
			.setColor(config().ping_command_embed_color)
			.setDescription(config().ping_command
				.replace(/{{latency}}/g, Date.now() - message.createdTimestamp)
				.replace(/{{api_latency}}/g, Math.round(client.ws.ping)));
			
			message.channel.send(embed);
		}
	} else if (command == "invite") {
		if (config().invite_command_enabled) {
			fs.readFile("app-data/invite.dat", "utf8" , (err, data) => {
				if (err) return;
	
				embed = new Discord.MessageEmbed()
				.setColor(config().invite_command_embed_color)
				.setDescription(config().invite_command
					.replace(/{{link}}/g, data.toString()));
				
				message.channel.send(embed);
			});
		}
	}
});

function config() {
	try { delete require.cache[require.resolve("../../app-data/config.json")]; }
	catch {}
	return require("../../app-data/config.json");
}

module.exports = {
	start: (n, p, i, t) => {
		name = n;
		prefixes = p.split(",");
		invite = i;
		client.login(t);
	},
	stop: () => { client.destroy(); },
	prefix: () => { return prefixes[0]; },
	name: () => { return name; }
}