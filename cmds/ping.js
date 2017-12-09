module.exports.run = async (bot, message, args) => {
	console.log(`${bot.user.username}: Pong! ${bot.ping}ms`) //Лог
	message.channel.send(`Pong! ${bot.ping}ms`); //Ответ
};

module.exports.help = {
	name: "ping"
}
