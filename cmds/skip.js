const Discord = require("discord.js"); //Discord.js
const ytdl = require("ytdl-core"); //Скчиваем видео
const ytsearch = require("youtube-search"); //Ищем видео

module.exports.run = async (bot, message, args) => {
	var server = bot.queue[message.guild.id]; //Получаем сервер
	if (server.dispatcher) server.dispatcher.end(); //Скипаем видео
};

module.exports.help = {
	name: "skip"
}
