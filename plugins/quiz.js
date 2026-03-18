import { games, createGame, startGame, endGame } from "../games/engine.js"

export default async function(client, message, args){

const input = message.body.toLowerCase().trim()

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"

/* EXIT */
if(input === ".exit"){
endGame(chat)
return message.reply("❌ Quiz ended")
}

/* RESTART */
if(input === ".restart"){
if(games[chat]){
games[chat].data = {}
return message.reply("🔄 Quiz restarted")
}
}

/* CREATE GAME */
if(!games[chat]){

createGame(chat,"quiz",sender,mode)

if(mode==="multi"){
return message.reply(
`🧠 Quiz Lobby

.join to join
.start to begin`
)
}

startGame(chat,sender)
}

let game = games[chat]

if(!game.data) game.data = {}

/* ASK QUESTION */
if(!game.data.answer){

try{

const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple")
const data = await res.json()

let q = data.results[0]

game.data.answer = q.correct_answer.toLowerCase()

let options = [...q.incorrect_answers, q.correct_answer]
.sort(()=>Math.random()-0.5)

await message.reply(
`🧠 Quiz

${q.question}

${options.join("\n")}

━━━━━━━━━━━━━━
▶ Commands:
.restart
.exit
━━━━━━━━━━━━━━`
)

}catch(err){
return message.reply("❌ Failed to fetch question")
}

return
}

/* IGNORE OTHER COMMANDS */
if(input.startsWith(".")) return

/* CHECK ANSWER */
if(game.started){

if(game.mode==="multi" && !game.players.includes(sender)) return

let correct = game.data.answer

// ✅ SMART MATCH
if(
input === correct ||
correct.includes(input) ||
input.includes(correct)
){

await message.reply(
`🎉 ${sender.split("@")[0]} got it right!`
)

// next question instead of ending
game.data.answer = null

}else{
return message.reply("❌ Wrong answer, try again")
}

}

}
