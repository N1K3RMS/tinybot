module.exports.run = async (bot, message, args) => {
	var server = bot.queue[message.guild.id]; //Получаем сервер
	if (server.dispatcher) server.dispatcher.end(); //Скипаем видео
};

module.exports.help = {
	name: "skip"
}
