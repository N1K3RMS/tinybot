const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	try {
		bot.generateInvite(['ADMINISTRATOR']).then(link => {
			var invite = new Discord.RichEmbed()
				.setAuthor("Ссылка на приглашение TinyBot!", bot.user.avatarURL, link)
				.setColor("#59ff5d")
			message.channel.send({embed: invite});
		});
	} catch(err) {
		console.log(err.stack);
	}
};

module.exports.help = {
	name: "invite"
}
