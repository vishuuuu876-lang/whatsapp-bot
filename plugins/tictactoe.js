import { games, createGame, startGame, endGame } from "../games/engine.js"

/* WIN CHECK FUNCTION */
function checkWinner(board, player){
const winPatterns = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
]

return winPatterns.some(pattern =>
pattern.every(i => board[i] === player)
)
}

export default async function(client, message, args){

const chat = message.from
const sender = message.author || message.from

/* START GAME */
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
return message.reply("⚠️ Send a number between 1-9")
}

let board = game.data.board

if(board[move-1] === "X" || board[move-1] === "O"){
return message.reply("❌ Position already taken")
}

/* PLAYER MOVE */
board[move-1] = "X"

/* CHECK PLAYER WIN */
if(checkWinner(board, "X")){
await message.reply(`🎉 You win!

${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}
`)
endGame(chat)
return
}

/* CHECK DRAW BEFORE BOT */
if(board.every(v => v === "X" || v === "O")){
await message.reply(`🤝 It's a draw!

${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}
`)
endGame(chat)
return
}

/* BOT MOVE */
let empty = board
.map((v,i)=>v!=="X" && v!=="O" ? i : null)
.filter(v=>v!==null)

let botMove = empty[Math.floor(Math.random()*empty.length)]
board[botMove] = "O"

/* CHECK BOT WIN */
if(checkWinner(board, "O")){
await message.reply(`🤖 Bot wins!

${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}
`)
endGame(chat)
return
}

/* CHECK DRAW AFTER BOT */
if(board.every(v => v === "X" || v === "O")){
await message.reply(`🤝 It's a draw!

${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}
`)
endGame(chat)
return
}

/* SHOW BOARD */
return message.reply(
`${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}`
)

}
