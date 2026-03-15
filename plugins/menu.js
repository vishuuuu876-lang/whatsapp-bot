export default async function (client, message) {

const menu = `
🤖 *Bot Commands*

🔎 Utility
.search topic
.weather city
.calculator 5+5

🎮 Games
.guess number
.dice
.rps rock
.quiz
.scramble
.tictactoe
.tod

⚙️ Other
.ping
.menu
`

message.reply(menu)

}
