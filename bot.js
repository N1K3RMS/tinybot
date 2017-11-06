//МОДУЛИ
const Discord = require("discord.js");
const osu = require('node-osu');
const ytdl = require('ytdl-core')
const search = require('youtube-search');
//НАСТРОЙКИ И КОНФИГ
const token = process.env.token;
const prefix = process.env.prefix;

var opts = {
  maxResults: 1,
  key: process.env.ytkey
};

var osuApi = new osu.Api(process.env.osutoken, {
    baseUrl: 'https://osu.ppy.sh/api',
    notFoundAsError: true,
    completeScores: false
});

var fortunes = [
    "Да!",
    "Нет!",
    "Возможно...",
    "Иногда"
];

function play(connection, message) {
	var server = servers[message.guild.id];
	
	search(server.queue[0], opts, function(err, data) {
		if (err) return console.log(err);
		data.map(function (data) {
			message.channel.sendMessage("Сейчас играет: " + data.title);
			
			var stream = ytdl(data.link, {filter: "audioonly", quality: "lowest"})
			
			server.dispatcher = connection.playStream(stream);
		});
		
		server.queue.shift();
		
		server.dispatcher.on("end", function() {
			if (server.queue[0]) play(connection, message);
			else connection.disconnect();
		});
	});
};

var bot = new Discord.Client();

var servers = {};

bot.on("ready", function() {
    console.log("Готов");
    bot.user.setGame('TinyBot | NK');
    bot.user.setStatus('online');
});

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(prefix)) return;

    var args = message.content.substring(prefix.length).split(" ");

    switch (args[0].toLowerCase()) {
        case "ping":
            message.channel.sendMessage("Pong!");
            break;
        case "ball":
            if (args[1]) message.reply(fortunes[Math.floor(Math.random() * fortunes.length)]);
            else message.reply("Не могу прочитать сообщение");
            break;
        case "osuprofile":
            osuApi.getUser({u: args[1]}).then(user => {
                var embed = new Discord.RichEmbed()
                    .setURL("https://osu.ppy.sh/u/" + user.id)
                    .setTitle("Osu! профиль | " + user.name)
                    .setColor("#ff66aa")
                    .addField("Главное", "**ID:** " + user.id + "\n**Страна:** " + user.country + "\n**Уровень:** " + user.level + "\n**Аккуратность:** " + user.accuracyFormatted, true)
                    .addField("PP", "**Всего:** " + user.pp.raw + "\n**Ранк:** #" + user.pp.rank + "\n**Ранк в " + user.country + ":** #" + user.pp.countryRank, true)
                    .addField("Карты", "**SS:** " + user.counts.SS + "\n**S:** " + user.counts.S + "\n**A:** " + user.counts.A, true)                   
                    .setFooter("Rikki BOT INFO | Osu! profile by NK");
                message.channel.sendEmbed(embed);
            })
            break;
        case "play":
            if (!args[1]) {
                message.reply("Пожалуйста введите сылку на видео на ютубе!");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.sendMessage("Вы не находитесь в голосовом канале!");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };

            var server = servers[message.guild.id];
			
            server.queue.push(message.content.split('t.play ')[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if (server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server =servers[message.guild.id];
            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        default:
            message.reply("Неизвестаная команда");
    }
})

bot.login(token);
