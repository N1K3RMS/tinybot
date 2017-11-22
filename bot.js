const Discord = require("discord.js"); //Discord.js
const fs = require("fs"); //Файловая система
const bot = new Discord.Client(); //Бот
bot.commands = new Discord.Collection(); //Комманды
bot.mutes = require("./mutes.json"); //Список с мутами
bot.queue = {}; //Очередь


//Загружаем список js файлов
fs.readdir("./cmds/", async (err, files) => {
	if(err) console.log(err); //Ошибка
	let jsfiles = files.filter(f => f.split(".").pop() === "js"); //Фильтер поиска js файлов
	
	//Количество загруженных команд
	if(jsfiles.length <= 0) {
		console.log(`Не одна команда не найдена или не загружена!`);
	}
	console.log(`Загружено ${jsfiles.length} команд!`);
	
	//Выдаём список загруженных команд
	jsfiles.forEach((f, i) => {
		let props = require(`./cmds/${f}`);
		console.log(`${i + 1}: ${f} загружен!`);
		bot.commands.set(props.help.name, props);
	});
});

//При готовности бота
bot.on("ready", async () => {
	console.log(`Бот готов! Имя бота: ${bot.user.username}`); //Сообщение о готовности
	bot.user.setGame("TinyBot | NK"); //Игра бота
	bot.user.setStatus("online"); //Статус бота
	
	//Генерируем ссылку на приглашения бота
	try {
		await bot.generateInvite(['ADMINISTRATOR']).then(link => {
			console.log(`Ссылка на приглашение: \n${link}`);
		});
	} catch(err) {
		console.log(err.stack);
	}
	
	//Проверяем файл с мутами и время мута
	bot.setInterval(() => {
		for(let i in bot.mutes) {
			let time = bot.mutes[i].time;
			let guildId = bot.mutes[i].guild;
			let guild = bot.guilds.get(guildId);
			let member = guild.members.get(i);
			let mutedRole = guild.roles.find(r => r.name === "Muted");
			if(!mutedRole) continue;

			if(Date.now() > time) {
				member.removeRole(mutedRole);
				delete bot.mutes[i];

				fs.writeFile("./mutes.json", JSON.stringify(bot.mutes), err => {
					if(err) console.log(err);
					console.log(`${bot.user.username}: Я размутил ${member.user.tag}!`);
				});
			}
		}
	}, 1000) //Интервал проверки в мс = 1 сек
});

//При получении сообщения
bot.on("message", async message => {
	if(message.author.bot) return; //Если отправитель бот
	if(!message.content.startsWith(process.env.prefix)) return; //Если сообщение без префикса

	let args = message.content.substring(message.content.split(" ")[0].length + 1); //Получаем аргументы
	let command = message.content.substring(process.env.prefix.length).split(" ")[0]; //Получаем команду

	let cmd = bot.commands.get(command); //Устанавливаем команду
	if(cmd) cmd.run(bot, message, args); //Запуск при получении команды
});

bot.login(process.env.token);
