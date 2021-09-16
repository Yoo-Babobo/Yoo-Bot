const Discord = require("discord.js");
const Intents = Discord.Intents;
const functions = require("../../app-data/functions");

var client;

var id;
var name;
var prefixes;
var owners;
var invite;
var token;

var commands = [];

client.on("ready", () => {
	if (config().status_enabled) {
		set_status();
		setInterval(set_status, config().status_cycle_time || 15000);
	}
})

client.on("message", (message) => {
	functions.message_events(message, client, { name: name, prefixes: prefixes, owners: owners, invite: invite });

	let prefix = false;
	for (const thisPrefix of prefixes) if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
	if (!prefix || message.author.bot || message.webhookID) return;
	
	const raw_args = message.content.slice(prefix.length).trim().split(/ +/);
	const command_name = raw_args.shift().toLowerCase();
	const args = raw_args.slice(0);
	let embed;
	let msg;

	let owner = false;
	for (const thisOwner of owners) if (message.author.id === thisOwner) owner = thisOwner;

	const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));

	try {
		if (command_name === "help") {
			if (config().help_command_enabled) {
				message.reply("lel");
			} else execute_commands(message, prefix, owner, command, command_name, args);
		} else if (command_name === "ping") {
			if (config().ping_command_enabled) {
				msg = config().ping_command_messages[Math.floor(Math.random() * config().ping_command_messages.length)]
					.replace(/{{latency}}/g, Date.now() - message.createdTimestamp)
					.replace(/{{api_latency}}/g, Math.round(client.ws.ping));
				
				if (config().ping_command_embed_enabled) {
					embed = new Discord.MessageEmbed()
						.setColor(config().ping_command_embed_colors[Math.floor(Math.random() * config().ping_command_embed_colors.length)])
						.setDescription(msg);
					
					message.channel.send(embed);
				} else message.channel.send(msg);
			} else execute_commands(message, prefix, owner, command, command_name, args);
		} else if (command_name === "invite") {
			if (config().invite_command_enabled) {
				msg = config().invite_command_messages[Math.floor(Math.random() * config().invite_command_messages.length)]
					.replace(/{{link}}/g, invite);
				
				if (config().invite_command_embed_enabled) {
					embed = new Discord.MessageEmbed()
						.setColor(config().invite_command_embed_colors[Math.floor(Math.random() * config().invite_command_embed_colors.length)])
						.setDescription(msg);
					
					message.channel.send(embed);
				} else message.channel.send(msg);
			} else execute_commands(message, prefix, owner, command, command_name, args);
		} else if (command) execute_commands(message, prefix, owner, command, command_name, args);
		else {
			if (config().command_unknown_enabled) {
				msg = config().command_unknown_messages[Math.floor(Math.random() * config().command_unknown_messages.length)]
					.replace(/{{command}}/g, command_name)
					.replace(/{{prefix}}/g, prefix);
				
				if (config().command_unknown_embed_enabled) {
					embed = new Discord.MessageEmbed()
						.setColor(config().command_unknown_embed_colors[Math.floor(Math.random() * config().command_unknown_embed_colors.length)])
						.setDescription(msg);
					
					message.channel.send(embed);
				} else message.channel.send(msg);
			}
		}
	} catch (err) {
		if (config().command_error_enabled) {
			msg = config().command_error_messages[Math.floor(Math.random() * config().command_error_messages.length)]
				.replace(/{{command}}/g, command_name)
				.replace(/{{error}}/g, err);
			
			if (config().command_error_embed_enabled) {
				embed = new Discord.MessageEmbed()
					.setColor(config().command_error_embed_colors[Math.floor(Math.random() * config().command_error_embed_colors.length)])
					.setDescription(msg);
				
				message.channel.send(embed);
			} else message.channel.send(msg);
		}
	}
});

function s(num) { return Math.abs(num) !== 1 ? "s" : ""; }

function execute_commands(message, prefix, owner, command, command_name, args) {
	const num_args = command.args || 0;
	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldown_amount = (command.cooldown || 1) * 1000;

	if (timestamps.has(message.author.id)) {
		const expiration_time = timestamps.get(message.author.id) + cooldown_amount;

		if (now < expiration_time) {
			if (config().command_cooldown_enabled) {
				const timeLeft = (expiration_time - now) / 1000;
				msg = config().command_cooldown_messages[Math.floor(Math.random() * config().command_cooldown_messages.length)]
					.replace(/{{s}}/g, s(parseFloat(timeLeft.toFixed(1))))
					.replace(/{{command}}/g, command_name)
					.replace(/{{cooldown}}/g, timeLeft.toFixed(1).replace("0.", ".").replace(".0", ""));
				
				if (config().command_cooldown_embed_enabled) {
					embed = new Discord.MessageEmbed()
						.setColor(config().command_cooldown_embed_colors[Math.floor(Math.random() * config().command_cooldown_embed_colors.length)])
						.setDescription(msg);
					
					return message.channel.send(embed);
				} else return message.channel.send(msg);
			} else return;
		}
	}

	if (command.guildOnly && message.channel.type !== "text") {
		if (config().command_guild_only_enabled) {
			msg = config().command_guild_only_messages[Math.floor(Math.random() * config().command_guild_only_messages.length)]
				.replace(/{{command}}/g, command_name);

			if (config().command_guild_only_embed_enabled) {
				embed = new Discord.MessageEmbed()
					.setColor(config().command_guild_only_embed_colors[Math.floor(Math.random() * config().command_guild_only_embed_colors.length)])
					.setDescription(msg);
				
				return message.channel.send(embed);
			} else return message.channel.send(msg);
		} else return;
	}

	if (command.dmsOnly && message.channel.type !== "dm") {
		if (config().command_dms_only_enabled) {
			msg = config().command_dms_only_messages[Math.floor(Math.random() * config().command_dms_only_messages.length)]
				.replace(/{{command}}/g, command_name);

			if (config().command_dms_only_embed_enabled) {
				embed = new Discord.MessageEmbed()
					.setColor(config().command_dms_only_embed_colors[Math.floor(Math.random() * config().command_dms_only_embed_colors.length)])
					.setDescription(msg);
				
				return message.channel.send(embed);
			} else return message.channel.send(msg);
		} else return;
	}

	if (command.ownersOnly && !owner) {
		if (config().command_owners_only_enabled) {
			msg = config().command_owners_only_messages[Math.floor(Math.random() * config().command_owners_only_messages.length)]
				.replace(/{{command}}/g, command_name)
				.replace(/{{s}}/g, s(owners.length));

			if (config().command_owners_only_embed_enabled) {
				embed = new Discord.MessageEmbed()
					.setColor(config().command_owners_only_embed_colors[Math.floor(Math.random() * config().command_owners_only_embed_colors.length)])
					.setDescription(msg);
				
				return message.channel.send(embed);
			} else return message.channel.send(msg);
		} else return;
	}

	if (command.permissions) {
		const author_perms = message.channel.permissionsFor(message.author);
		if (!author_perms || !author_perms.has(command.permissions) || !author_perms.has("ADMINISTRATOR")) {
			if (config().command_no_permission_enabled) {
				if (Array.isArray(command.permissions)) msg = config().command_no_permission_messages[Math.floor(Math.random() * config().command_no_permission_messages.length)]
					.replace(/{{permissions}}/g, command.permissions.join(", ").toUpperCase())
					.replace(/{{command}}/g, command_name)
					.replace(/{{s}}/g, s(command.permissions.length));
				else msg = config().command_no_permission_messages[Math.floor(Math.random() * config().command_no_permission_messages.length)]
					.replace(/{{permissions}}/g, command.permissions.toUpperCase())
					.replace(/{{command}}/g, command_name)
					.replace(/{{s}}/g, "s");
				
				if (config().command_no_permission_embed_enabled) {
					embed = new Discord.MessageEmbed()
						.setColor(config().command_no_permission_embed_colors[Math.floor(Math.random() * config().command_no_permission_embed_colors.length)])
						.setDescription(msg);
					
					return message.channel.send(embed);
				} else return message.channel.send(msg);
			} else return;
		}
	}

	if (command.botPermissions) {
		const bot_perms = message.channel.permissionsFor(message.client.user);
		if (!bot_perms || !bot_perms.has(command.botPermissions) || !bot_perms.has("ADMINISTRATOR")) {
			if (config().command_no_bot_permission_enabled) {
				if (Array.isArray(command.botPermissions)) msg = config().command_no_bot_permission_messages[Math.floor(Math.random() * config().command_no_bot_permission_messages.length)]
					.replace(/{{permissions}}/g, command.botPermissions.join(", ").toUpperCase())
					.replace(/{{command}}/g, command_name)
					.replace(/{{s}}/g, s(command.botPermissions.length));
				else msg = config().command_no_bot_permission_messages[Math.floor(Math.random() * config().command_no_bot_permission_messages.length)]
					.replace(/{{permissions}}/g, command.botPermissions.toUpperCase())
					.replace(/{{command}}/g, command_name)
					.replace(/{{s}}/g, "s");
				
				if (config().command_no_bot_permission_embed_enabled) {
					embed = new Discord.MessageEmbed()
						.setColor(config().command_no_bot_permission_embed_colors[Math.floor(Math.random() * config().command_no_bot_permission_embed_colors.length)])
						.setDescription(msg);
					
					return message.channel.send(embed);
				} else return message.channel.send(msg);
			} else return;
		}
	}

	if (num_args !== args.length) {
		if (config().command_incorrect_usage_enabled) {
			var result = command.usage ? " " + command.usage : num_args === 0 ? "" : " <" + num_args + " required argument" + s(num_args) + ">";
			msg = config().command_incorrect_usage_messages[Math.floor(Math.random() * config().command_incorrect_usage_messages.length)]
				.replace(/{{command}}/g, command_name)
				.replace(/{{usage}}/g, prefix + command_name + result);
			
			if (config().command_incorrect_usage_embed_enabled) {
				embed = new Discord.MessageEmbed()
					.setColor(config().command_incorrect_usage_embed_colors[Math.floor(Math.random() * config().command_incorrect_usage_embed_colors.length)])
					.setDescription(msg);
				
				return message.channel.send(embed);
			} else return message.channel.send(msg);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldown_amount);

	command.execute(message, args, { name: name, prefix: prefix, owners: owners, invite: invite });
}

function config() {
	try { delete require.cache[require.resolve("../../app-data/config.json")]; }
	catch {}
	return require("../../app-data/config.json");
}

function load_commands() {
	client.commands = new Discord.Collection();
	client.cooldowns = new Discord.Collection();

	const command_folders = fs.readdirSync("./app-data/bots/discord/" + id + "/commands");
	for (const folder of command_folders) {
		const command_files = fs.readdirSync("./app-data/bots/discord/" + id + "/commands/" + folder).filter(file => file.endsWith(".js"));
		for (const file of command_files) {
			const command = require("./app-data/bots/discord/" + id + "/commands/" + folder + "/" + file);
			client.commands.set(command.name, command);
		}
	}
}

function load_slash_commands() {
	const command_files = fs.readdirSync("./app-data/bots/discord/" + id + "/slash").filter(file => file.endsWith(".js"));
	for (const file of command_files) {
		const command = require("./app-data/bots/discord/" + id + "/slash/" + file);
		commands.push(command.data.toJSON());
	}
}

function load_events() {
	const event_files = fs.readdirSync("./app-data/bots/discord/" + id + "/events").filter(file => file.endsWith(".js"));
	for (const file of event_files) {
		const event = require("./app-data/bots/discord/" + id + "/events/" + file);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
	}
}

function set_status() {
	var status = config().statuses[Math.floor(Math.random() * config().statuses.length)];
	client.user.setPresence({
		activity: {
			name: status.name
				.replace(/{{name}}/g, name)
				.replace(/{{prefix}}/g, prefixes[0])
				.replace(/{{servers}}/g, client.guilds.cache.size)
				.replace(/{{channels}}/g, client.channels.cache.size)
				.replace(/{{users}}/g, client.users.cache.size) || prefixes[0] + "help",
			type: status.type || "PLAYING",
			url: status.url || null
		},
		status: status.status || "online"
	});
}

module.exports = {
	a: 1,
	start: (id, n, p, o, i, t) => {
		id = id;
		name = n;
		prefixes = p.split(/,+/);
		owners = o.split(/,+/);
		invite = i;
		token = t;
		client = new Discord.Client({
			intents: [
				Intents.FLAGS.GUILDS
			]
		});
		load_commands();
		load_slash_commands();
		load_events();
		client.login(token);
	},
	stop: () => { client.destroy(); },
	restart: (id, n, p, o, i, t) => {
		id = id;
		name = n;
		prefixes = p.split(/,+/);
		owners = o.split(/,+/);
		invite = i;
		token = t;
		client.destroy();
		client = new Discord.Client({
			intents: [
				Intents.FLAGS.GUILDS
			]
		});
		load_commands();
		load_slash_commands();
		load_events();
		client.login(token);
	},
	id: () => { return id; },
	name: () => { return name; },
	prefix: () => { return prefixes[0]; },
	owners: () => { return owners; },
	invite: () => { return invite; }
}