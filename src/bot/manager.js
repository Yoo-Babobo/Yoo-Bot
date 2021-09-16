const ShardingManager = require("discord.js").ShardingManager;
const manager = new ShardingManager("./bot.js", { token: "TODO: <token>"});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();