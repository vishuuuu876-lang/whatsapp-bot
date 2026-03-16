export default async function (client, message) {

const menu = `
🤖 *WhatsApp Bot Menu*

━━━━━━━━━━━━━━

🌐 Utility
.weather city
.translate lang text
.search topic
.calculator 5+5

🎮 Games
.quiz
.scramble
.rps
.tictactoe
.dice
.guess
.tod

🎵 Media
.yt search
.music song
.sticker
.image keyword

😂 Fun
.meme

⚙️ System
.ping
.menu
.join
.leave
.start
.players
.status

━━━━━━━━━━━━━━
`

message.reply(menu)

}
