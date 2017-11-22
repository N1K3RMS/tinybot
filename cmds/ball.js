//Варианты ответа
var ball = [
    "Да!",
    "Нет!",
    "Возможно...",
    "Иногда"
];

module.exports.run = async (bot, message, args) => {
	console.log(`${bot.user.username}: Ответил ${sender.username} на вопрос: ${args}`) //Лог
	if (args) message.reply(ball[Math.floor(Math.random() * ball.length)]); //Ответ
	else message.reply("Не могу прочитать сообщение"); //Если сообщение не найдено
};

module.exports.help = {
	name: "ball"
}