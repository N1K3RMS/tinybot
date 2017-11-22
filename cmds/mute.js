const Discord = require("discord.js"); //Основной модуль Discord
const fs = require("fs"); //Файловая система

module.exports.run = async (bot, message, args) => {
	if(!message.member.hasPermission("MANAGE_MESSAGES")) message.channel.send("Недостаточно прав!"); //Если нет прав

	let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args); //Пользователь
	if(!toMute) message.channel.send("Вы не ввели discord tag пользователя!"); //Если пользователь не найден

	var role = message.guild.roles.find("name", "Muted")

	//Если нет роли
	if(!role) {
		//Создаём роль
		try {
			role = await message.guild.createRole({
				name: "Muted", //Имя роли
				color: "#000000", //Цвет роли в HEX
				permissions: 0, //Права роли
			});

			//
			message.guild.channels.forEach(async (channel, id) => {
				//Меня разрешения у роли
				await channel.overwritePermissions(role, {
					SEND_MESSAGES: false, //Писать сообщения
					ADD_REACTIONS: false //Добавлять реакции
				});
			});
		} catch(e) {
			console.log(e.stack); //Ловим ошибки
		}
	}

	if(toMute.roles.has(role.id)) return message.channel.send("Этот пользователь уже в муте!"); //Если пользователь уже в муте

	var arg = args.split(" "); //Получаем каждый аргумент

	//Кидаем в мут пользователя
	bot.mutes[toMute.id] = {
		guild: message.guild.id, //Сервер
		time: Date.now() + parseInt(arg[1]) * 1000 //Получаем время мута
	}

	//Сохраняем файл с мутами
	fs.writeFile("./mutes.json", JSON.stringify(bot.mutes, null, 4), err => {
		if(err) console.log(err); //Ошибка
		if(arg[1]) message.channel.send(`${toMute.user.tag} был отправлен в мут на: ${test[1]} сек!`);
		if(!arg[1]) message.channel.send(`${toMute.user.tag} был отправлен в мут навсегда!`);
	});
	await toMute.addRole(role); //Добавляем роль пользователю
	role.setPosition(1, true)
		.then(r => console.log(`Role position: ${r.position}`))
		.catch(console.error);
}

module.exports.help = {
	name: "mute"
}
