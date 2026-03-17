import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

export default async function(client, message, args){

const input = message.body.toLowerCase().trim()  // ✅ ADD HERE

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"
if(!games[chat]){

createGame(chat,"rps",sender,mode)

if(mode === "multi"){
return message.reply(
`✊ Rock Paper Scissors Lobby

.join to join
.start to begin (2 players max)`
)
}

startGame(chat, sender)

return message.reply(
`✊ Rock Paper Scissors

Send:
rock
paper
scissors`
)
}
/* JOIN */

if(input === ".join"){

if(game.players.length >= 2)
return message.reply("❌ RPS only supports 2 players")

joinGame(chat, sender)

return message.reply(`Player joined (${game.players.length}/2)`)
}

/* START */

if(input === ".start"){

if(sender !== game.host)
return message.reply("Only the host can start")

if(game.mode === "multi" && game.players.length < 2)
return message.reply("Need 2 players")

startGame(chat, sender)

return message.reply(
`✊ Rock Paper Scissors

Send:
rock
paper
scissors`
)
}

/* GAME INPUT */

if(game.started){

if(game.mode === "multi" && !game.players.includes(sender))
return

const options = ["rock","paper","scissors"]
let choice = input

if(!options.includes(choice)){
   return message.reply("❌ Send: rock / paper / scissors")
}

/* SINGLE PLAYER */

if(game.mode === "single"){

let bot = options[Math.floor(Math.random()*3)]

if(choice === bot){
await message.reply(`🤝 Draw!\nYou: ${choice}\nBot: ${bot}`)
}
else if(
(choice === "rock" && bot === "scissors") ||
(choice === "paper" && bot === "rock") ||
(choice === "scissors" && bot === "paper")
){
await message.reply(`🎉 You win!\nBot chose: ${bot}`)
}
else{
await message.reply(`🤖 Bot wins!\nBot chose: ${bot}`)
}

endGame(chat)
return
}

/* MULTIPLAYER */

game.data[sender] = choice

if(Object.keys(game.data).length === 2){

let players = Object.keys(game.data)

let p1 = game.data[players[0]]
let p2 = game.data[players[1]]

let result = "Draw"

if(
(p1==="rock" && p2==="scissors") ||
(p1==="paper" && p2==="rock") ||
(p1==="scissors" && p2==="paper")
){
result = `${players[0].split("@")[0]} wins`
}
else if(p1 !== p2){
result = `${players[1].split("@")[0]} wins`
}

await message.reply(
`✊ RPS Result

${players[0].split("@")[0]}: ${p1}
${players[1].split("@")[0]}: ${p2}

🏆 ${result}`
)

game.data = {}
endGame(chat)

}

}

}
