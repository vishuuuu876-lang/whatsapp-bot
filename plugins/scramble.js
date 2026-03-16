import { games,createGame,joinGame,startGame,endGame } from "../games/engine.js"

export default async function(client,message,args){

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"

if(!games[chat]){

createGame(chat,"scramble",sender,mode)

if(mode==="multi"){
message.reply(`🔤 Scramble Lobby

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

if(sender!==game.host) return

startGame(chat)

const res = await fetch("https://random-word-api.herokuapp.com/word")
const data = await res.json()

let word=data[0]

let scrambled=word
.split("")
.sort(()=>Math.random()-0.5)
.join("")

game.data.word=word

message.reply(`🔤 Unscramble

${scrambled}`)

return
}

if(game.started){

if(game.mode==="multi" && !game.players.includes(sender)) return

let guess=message.body.toLowerCase()

if(guess===game.data.word){
message.reply(`🎉 ${sender.split("@")[0]} solved it!`)
endGame(chat)
}

}

}
