import { games,createGame,joinGame,startGame,endGame } from "../games/engine.js"

export default async function(client,message,args){

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"

if(!games[chat]){

createGame(chat,"quiz",sender,mode)

if(mode==="multi"){
message.reply(`🧠 Quiz Lobby

.join to join
.start to begin`)
return
}

startGame(chat)
}

let game = games[chat]

if(message.body===".join"){
joinGame(chat,sender)
message.reply(`Player joined (${game.players.length})`)
return
}

if(message.body===".start"){

if(sender!==game.host) return message.reply("Only host can start")

startGame(chat)

const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple")
const data = await res.json()

let q = data.results[0]

game.data.answer = q.correct_answer.toLowerCase()

let options=[...q.incorrect_answers,q.correct_answer]
.sort(()=>Math.random()-0.5)

message.reply(`🧠 Quiz

${q.question}

${options.join("\n")}`)

return
}

if(game.started){

if(game.mode==="multi" && !game.players.includes(sender)) return

let answer = message.body.toLowerCase()

if(answer===game.data.answer){
message.reply(`🎉 ${sender.split("@")[0]} got it right!`)
endGame(chat)
}

}

}
