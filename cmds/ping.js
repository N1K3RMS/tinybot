module.exports.run = async (bot, message, args) => {
	console.log(`${bot.user.username}: Pong!`) //Лог
	message.channel.send("Pong!"); //Ответ
};

module.exports.help = {
	name: "ping"
}