const Discord = require("discord.js"); //Discord.js
const ytdl = require("youtube-dl"); //Скчиваем видео
const yts = require("youtube-search"); //Ищем видео

async function play(connection, message, bot) {
	var server = bot.queue[message.guild.id];
	console.log(`${bot.user.username}: Сейчас играет: ${server.queue[0].title}`); //Лог
	var description = server.queue[0].description.substring(0, 150) + '...';
	
	var videoinfo = new Discord.RichEmbed()
		.setAuthor(server.queue[0].title, bot.user.avatarURL, server.queue[0].url)
		.setColor("#ff3b3b")
		.setThumbnail(server.queue[0].thumbnail)
		.setDescription(`**Описание:** ${description}`)
		.setFooter("TinyBot v0.4");
	await message.channel.send({embed: videoinfo}); //Отправляем embed
	
	var stream = ytdl(server.queue[0].id, ['-f', 'bestaudio[ext=m4a]']);
	server.dispatcher = connection.playStream(stream, { volume: 0.3 });
	
	server.dispatcher.on("end", () => {
		server.queue.shift();
		
		if(server.queue[0]) play(connection, message, bot);
		else connection.disconnect();
	})
};

module.exports.run = async (bot, message, args) => {
	if (!args) {
			message.channel.send("Пожалуйста введите ссылку или название видео!");
	}

	if (!message.member.voiceChannel) {
			message.channel.send("Вы не находитесь в голосовом канале!");
	}

	if (!bot.queue[message.guild.id]) bot.queue[message.guild.id] = {
			queue: []
	}
	
	var server = bot.queue[message.guild.id]; //Получаем сервер
	var ytlc = args.indexOf("youtube.com/watch") >= 0;
	
	//Если это ссылка
	if(ytlc == true) {
		ytdl.getInfo(args, ['-f', 'bestaudio[ext=m4a]'], (err, data) => {
			if(err) console.log(err);
			
			server.queue.push({
				"id": data.id,
				"title": data.title,
				"url": data.url,
				"thumbnail": data.thumbnail,
				"description": data.description
			});
			
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then((connection) => {
				play(connection, message, bot);
			});
		});
	}

	//Если это не ссылка
	if(ytlc == false) {
		yts(args, { maxResults: 1, key: process.env.ytkey }, (err, data) => {
			if(err) console.log(err);
			
			data.map((data) => {
				var ytcc = data.link.indexOf("youtube.com/channel") >= 0;
				var ytpc = data.link.indexOf("youtube.com/playlist") >= 0;
				
				if(ytcc == true) {
					message.channel.send("Это канал а не видео!");
				}
				
				if (ytpc == true) {
					message.channel.send("Это playlist! к сожеленеию бот не может проиграть вам его ;(");
				}
				
				if (ytcc === false) {
					if (ytpc === false) {
						server.queue.push({
							"id": data.id,
							"title": data.title,
							"url": data.link,
							"thumbnail": data.thumbnails.high.url,
							"description": data.description
						});
						
						if (!message.guild.voiceConnection) message.member.voiceChannel.join().then((connection) => {
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
