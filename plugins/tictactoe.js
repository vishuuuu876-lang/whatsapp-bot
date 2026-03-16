import { games, createGame, startGame, endGame } from "../games/engine.js"

export default async function(client,message,args){

const chat = message.from
const sender = message.author || message.from

if(!games[chat]){

createGame(chat,"tictactoe",sender,"single")
startGame(chat,sender)

games[chat].data = {
board:["1","2","3","4","5","6","7","8","9"]
}

return message.reply(`🎮 Tic Tac Toe

1 | 2 | 3
---------
4 | 5 | 6
---------
7 | 8 | 9

Send a number (1-9)`)
}

let game = games[chat]

if(!game.data) return

let move = parseInt(message.body)

if(isNaN(move) || move < 1 || move > 9){
return message.reply("Send a number between 1-9")
}

let board = game.data.board

if(board[move-1] === "X" || board[move-1] === "O"){
return message.reply("❌ Position already taken")
}

board[move-1] = "X"

/* BOT MOVE */

let empty = board
.map((v,i)=>v!=="X" && v!=="O" ? i : null)
.filter(v=>v!==null)

if(empty.length > 0){

let botMove = empty[Math.floor(Math.random()*empty.length)]
board[botMove] = "O"

}

let view = `
${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}
`

await message.reply(view)

}
