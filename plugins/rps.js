import { games,createGame,joinGame,startGame,endGame } from "../games/engine.js"

export default async function(client,message,args){

const chat = message.from
const sender = message.author || message.from
const mode = args[0] || "single"

if(!games[chat]){

createGame(chat,"rps",sender,mode)

if(mode==="multi"){
message.reply(`✊ RPS Lobby

.join to join
.start to play`)
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

message.reply(`✊ Rock Paper Scissors

Send:
rock
paper
scissors`)
return
}

if(game.started){

if(game.mode==="multi" && !game.players.includes(sender)) return

let choice=message.body.toLowerCase()

const options=["rock","paper","scissors"]

if(!options.includes(choice)) return

if(game.mode==="single"){

let bot=options[Math.floor(Math.random()*3)]

if(choice===bot){
message.reply(`Draw!\nYou:${choice}\nBot:${bot}`)
}
else if(
(choice==="rock" && bot==="scissors")||
(choice==="paper" && bot==="rock")||
(choice==="scissors" && bot==="paper")
){
message.reply(`🎉 You win!\nBot:${bot}`)
}
else{
message.reply(`Bot wins!\nBot:${bot}`)
}

endGame(chat)

}else{

game.data[sender]=choice

if(Object.keys(game.data).length===2){

let players=Object.keys(game.data)

let p1=game.data[players[0]]
let p2=game.data[players[1]]

let result="Draw"

if(
(p1==="rock" && p2==="scissors")||
(p1==="paper" && p2==="rock")||
(p1==="scissors" && p2==="paper")
){
result=`${players[0].split("@")[0]} wins`
}
else if(p1!==p2){
result=`${players[1].split("@")[0]} wins`
}

message.reply(`✊ RPS Result

${players[0].split("@")[0]}: ${p1}
${players[1].split("@")[0]}: ${p2}

${result}`)

endGame(chat)

}

}

}

}
