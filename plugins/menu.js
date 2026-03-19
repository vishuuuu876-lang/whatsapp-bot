import { getUserCount } from "../users.js"

export default async function(client, message, args){

    const count = getUserCount()

    const menu =
`🤖 *WhatsApp Bot Menu*
👥 *${count} users* have used this bot

━━━━━━━━━━━━━━

🌐 *Utility*
*.weather* city
*.translate* text
*.search* topic
*.calculator* 5+5

🎮 *Games*
*.tictactoe* — vs bot
*.rps* — rock paper scissors
*.scramble* — word scramble
*.quiz* — trivia quiz
*.guess* — number guessing
*.dice* — roll a dice
*.tod* — truth or dare
*.truth* — get a truth
*.dare* — get a dare

_Games support single & multiplayer_
_Multiplayer only works in group chats_
_Type .help inside any game for commands_
_Type .end anytime to quit a game_

🎵 *Media*
*.yt* song name
*.music* song name
*.image* keyword
*.meme* — random meme

💼 *Business*
*.business* — bot solutions for your business

ℹ️ *Info*
*.info* — about the creator

⚙️ *System*
*.ping* — check if bot is online
*.users* — total bot users (owner only)
*.menu* — show this menu
*.end* — exit any active game

━━━━━━━━━━━━━━
_Send any command to get started!_`

    await message.reply(menu)

}
