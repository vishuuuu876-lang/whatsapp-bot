import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

export default async function(client, message, args){

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"

if(!games[chat]){

createGame(chat,"scramble",sender,mode)

if(mode === "multi"){
return message.reply(
`🔤 Word Scramble Lobby

.join to join
.start to begin`
)
}

startGame(chat, sender)
}

let game = games[chat]

if(!game.data) game.data = {}

/* JOIN */

if(message.body === ".join"){
joinGame(chat, sender)
return message.reply(`Player joined (${game.players.length})`)
}

/* START */

if(message.body === ".start"){

if(sender !== game.host)
return message.reply("Only the host can start")

startGame(chat, sender)

try{

const res = await fetch("https://random-word-api.herokuapp.com/word")
const data = await res.json()

let word = data[0]

let scrambled = word
.split("")
.sort(()=>Math.random()-0.5)
.join("")

/* Prevent same word */

while(scrambled === word){
scrambled = word
.split("")
.sort(()=>Math.random()-0.5)
.join("")
}

game.data.word = word

await message.reply(
`🔤 Unscramble this word:

${scrambled}`
)

}catch(err){

await message.reply("❌ Failed to fetch word")

}

return
}

/* GAME INPUT */

if(game.started){

if(game.mode === "multi" && !game.players.includes(sender)) return

let guess = message.body.toLowerCase()

if(guess === game.data.word){

await message.reply(
`🎉 ${sender.split("@")[0]} solved it!\nWord: ${game.data.word}`
)

endGame(chat)

}

}

}
