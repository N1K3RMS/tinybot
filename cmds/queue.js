module.exports.run = async (bot, message, args) => {
	if(!bot.queue[message.guild.id]) message.channel.send("Список пуст!"); //Запись список найден
	if(bot.queue[message.guild.id]) {
		var server = bot.queue[message.guild.id]; //Получаем сервер
		if(server.queue.length <= 0) message.channel.send("Список пуст!"); //Если названия в списке не найдены
		if(!server.queue.length <= 0) {
			//Получаем список видео
			server.queue.forEach((video, i, queue) => {
				i = i + 1;
				
				if(i === 1) list = `${i}: ${video.title}`
				else list = `${list}\n${i}: ${video.title}`;
				
				if(i === queue.length) message.channel.send(list);
			});
		}
	}
}

module.exports.help = {
	name: "queue"
}
