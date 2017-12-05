module.exports.run = async (bot, message, args) => {
	if(!bot.queue[message.guild.id]) message.channel.send("Список пуст!"); //Запись список найден
	if(bot.queue[message.guild.id]) {
		var server = bot.queue[message.guild.id]; //Получаем сервер
		if(server.queue.length <= 0) message.channel.send("Список пуст!"); //Если названия в списке не найдены
		if(!server.queue.length <= 0) {
			//Получаем список видео
			server.queue.forEach((f, i) => {
				message.channel.send(`${i + 1}: ${f.title}`) //Выводим список
			})
		}
	}
}

module.exports.help = {
	name: "queue"
}
