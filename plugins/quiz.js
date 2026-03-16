import { games, createGame, startGame, endGame } from "../games/engine.js"

export default async function(client, message, args){

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"

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

/* START QUESTION */

if(!game.data.answer){

const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple")
const data = await res.json()

let q = data.results[0]

game.data.answer = q.correct_answer.toLowerCase()

let options = [...q.incorrect_answers, q.correct_answer]
.sort(()=>Math.random()-0.5)

await message.reply(
`🧠 Quiz

${q.question}

${options.join("\n")}`
)

return
}

/* CHECK ANSWER */

if(game.started){

if(game.mode==="multi" && !game.players.includes(sender)) return

let answer = message.body.toLowerCase()

if(answer === game.data.answer){

await message.reply(
`🎉 ${sender.split("@")[0]} got it right!`
)

game.data.answer = null
}
}

}
