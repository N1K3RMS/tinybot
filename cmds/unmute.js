const Discord = require("discord.js"); //Основной модуль Discord
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
	if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have manage messages");

	let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args);
	if(!toMute) return message.channel.send("You did not specify a user mention or ID");

	let role = message.guild.roles.find(r => r.name === "Muted");

	if(!role || !toMute.roles.has(role.id)) return message.channel.send("Этот пользователь не в муте!");

	await toMute.removeRole(role);

	delete bot.mutes[toMute.id];

	fs.writeFile("./mutes.json", JSON.stringify(bot.mutes), err => {
		if(err) throw err;
		console.log(`${bot.user.username}: Я размутил ${toMute.user.tag}!`);
	});

	message.channel.send(`${toMute.user.tag} был убран из мута!`);
};

module.exports.help = {
	name: "unmute"
}
