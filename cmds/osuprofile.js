const Discord = require("discord.js"); //Discord.js
const osu = require('node-osu'); //node-osu

//Osu Api
var osuApi = new osu.Api(process.env.osutoken, {
    baseUrl: "https://osu.ppy.sh/api",
    notFoundAsError: true,
    completeScores: false
});

module.exports.run = async (bot, message, args) => {
	console.log(`${bot.user.username}: Поиск Osu! пользователя: ${args}`) //Лог
	//Ишем пользователя
	osuApi.getUser({u: args}).then(user => {
		var embed = new Discord.RichEmbed() //Embed
			.setURL("https://osu.ppy.sh/u/" + user.id) //Ссылка на пользователя
			.setTitle("Osu! профиль | " + user.name) //Название embed
			.setColor("#ff66aa") //Цвет embed
			.addField("Основное", "**ID:** " + user.id + "\n**Страна:** " + user.country + "\n**Уровень:** " + user.level + "\n**Аккуратность:** " + user.accuracyFormatted, true) //Основное
			.addField("PP", "**Всего:** " + user.pp.raw + "\n**Ранк:** #" + user.pp.rank + "\n**Ранк в " + user.country + ":** #" + user.pp.countryRank, true) //PP
			.addField("Карты", "**SS:** " + user.counts.SS + "\n**S:** " + user.counts.S + "\n**A:** " + user.counts.A, true) //Карты
			.setFooter("Osu! profile | TinyBot v0.4"); //Футёр
		message.channel.send({embed: embed}); //Отправка embed
	});
};

module.exports.help = {
	name: "osuprofile"
}
