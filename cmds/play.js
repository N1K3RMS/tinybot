const Discord = require("discord.js"); //Discord.js
const ytdl = require("ytdl-core"); //Скчиваем видео
const ytsearch = require("youtube-search"); //Ищем видео

//Настройки поиска
var ytsopt = {
	maxResults: 1,
	key: process.env.ytkey
};

//Настройки скачивания
var ytdlopt = {
	f: "audioonly",
	q: "lowest"
};

function play(connection, message, bot) {
	var server = bot.queue[message.guild.id]; //Получаем сервер

	var videoID = server.queue[0].url; //ID видео
	ytdl.getInfo(videoID, {filter: ytdlopt.f, quality: ytdlopt.q}, (err, data) => {
		if(err) {
			console.log(err);
			message.channel.send("Видео не найдено!");
		}
		console.log(`${bot.user.username}: Сейчас играет: ${data.title}`); //Лог
		var desc = data.description.substring(0, 150) + '...'; //Если описание больше 100 символов
		var time = Math.floor(data.length_seconds / 60) + ':' + data.length_seconds % 60;

		var videoinfo = new Discord.RichEmbed() //embed
			.setAuthor(data.title, bot.user.avatar, videoID)
			.setColor("#ff3b3b")
			.setThumbnail(data.thumbnail_url) //Превью
			.setDescription(`**Описание:** ${desc}\n**Автор:** ${data.author.name}\n**Просмотров:** ${data.view_count}`)
			.setFooter(`Длина: ${time} | TinyBot v0.4`); //Футёр
		message.channel.send({embed: videoinfo}); //Отправляем embed

		var stream = ytdl(videoID, {filter: ytdlopt.f, quality: ytdlopt.q}); //Стрим
		server.dispatcher = connection.playStream(stream); //Запускаем стрим

		server.dispatcher.on("end", () => {
			server.queue.shift(); //Скипаем лист

			if(server.queue[0]) play(connection, message, bot); //Если видео ещё есть то запускаем его
			else connection.disconnect(); //Если нет то отключаемся
		})
	})
};

module.exports.run = async (bot, message, args) => {
	if (!args) {
			message.reply("Пожалуйста введите ссылку или название видео!");
	}

	if (!message.member.voiceChannel) {
			message.channel.send("Вы не находитесь в голосовом канале!");
	}

	if (!bot.queue[message.guild.id]) bot.queue[message.guild.id] = {
			queue: []
	}
	
	var server = bot.queue[message.guild.id]; //Получаем сервер
	var ytlc = args.indexOf("youtube.com/watch") >= 0; //Чекаем ссылка ли это
	
	//Если это ссылка
	if(ytlc == true) {
		ytdl.getInfo(args, {filter: ytdlopt.f, quality: ytdlopt.q}, (err, data) => {
			server.queue.push({
				"title": data.title,
				"url": args
			});
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
				play(connection, message, bot);
			});
		});
	}

	//Если это не ссылка
	if(ytlc == false) {
		ytsearch(args, ytsopt, (err, data) => {
			if(err) console.log(err);
				data.map((data) => {
					var ytcc = data.link.indexOf("youtube.com/channel") >= 0; //Чекаем канал ли это
					var ytpc = data.link.indexOf("youtube.com/playlist") >= 0; //Чекаем playlist ли это
					if(ytcc == true) {
						message.channel.send("Это канал а не видео!");
					}
					if (ytpc == true) {
						message.channel.send("Это playlist! к сожеленеию бот пока не может проиграть вам его ;(");
					}
					if (ytcc === false) { //Если не канал
						if (ytpc === false){ //Если не playlist
							server.queue.push({
								"title": data.title,
								"url": data.link
							});
							if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
								play(connection, message, bot);
							})
						}
					}
				})
		})
	}
};

module.exports.help = {
	name: "play"
}
