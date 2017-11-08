//Connect mudules
const Discord = require("discord.js"); //basic discord bot library
const ytdl = require("ytdl-core"); //youtube download core
const yts = require("youtube-search"); //search videos in youtube
const httpapi = require("node-osu"); //module for http requst witch basic api
//Setting up
const token = process.env.token; //discord bot token
const prefix = process.env.prefix; //discord bot prefix
var ytopt = { //yts options
	maxResults: 1, //results
	key: process.env.ytkey //youtube key
};
var osuApi = new httpapi.Api(process.env.osutoken, { //osu api + osu key
	baseUrl: 'https://osu.ppy.sh/api', //api url
	notFoundAsError: true,
	completeScores: false
});
var fortunes = [ //Fortune answer
    "Да!",
    "Нет!",
    "Возможно...",
    "Иногда"
];

//Functions
function play(connection, message) {
	var server = servers[message.guild.id];
	var ytlinkcheck = server.queue[0].indexOf("youtube.com/watch") >= 0; //check youtube link or title of video
	
	if (ytlinkcheck == true) {
		ytdl.getInfo(server.queue[0], {filter: "audioonly", quality: "lowest"}, function (err, data) {
			message.channel.sendMessage("Сейчас играет: " + data.title);

			var stream = ytdl(server.queue[0], {filter: "audioonly", quality: "lowest"})
			
			server.dispatcher = connection.playStream(stream);
			server.queue.shift();
			
			server.dispatcher.on("end", function() {
				if (server.queue[0]) play(connection, message);
				else connection.disconnect();
			});
		});
	} else {
		yts(server.queue[0], ytopt, function(err, data) {
			if (err) return console.log("ERROR 4: VIDEO NOT FOUND!");
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
	}
};

//Bot script
var bot = new Discord.Client(); //bot

var servers = {}; //servers cvar

bot.on("ready", function() { //when bot loaded
    console.log("Готов"); //log
    bot.user.setGame('TinyBot | NK'); //discord bot game
    bot.user.setStatus('online'); //discord bot status
});

bot.on("message", function(message) { //when bot message
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
                    .setFooter("TinyBot v0.3 | Osu! profile");
                message.channel.sendEmbed(embed);
            })
            break;
        case "play":
            if (!args[1]) {
                message.reply("Пожалуйста введите ссылку или !");
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
			
            server.queue.push(message.content.substring(7));

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if (server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        default:
            message.reply("Неизвестаная команда");
    }
})

bot.login(token); //bot login
