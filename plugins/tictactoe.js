let games = {}

export default async function(client, message, args){

const chat = message.from

// start game
if(!games[chat]){

games[chat] = {
board:["1","2","3","4","5","6","7","8","9"],
turn:"X"
}

message.reply(`🎮 Tic Tac Toe

1 | 2 | 3
4 | 5 | 6
7 | 8 | 9

Send a number (1-9) to play.`)

return
}

// play move
let game = games[chat]

let move = parseInt(message.body)

if(!move || move<1 || move>9){
message.reply("Send a number between 1-9")
return
}

if(game.board[move-1]==="X" || game.board[move-1]==="O"){
message.reply("❌ Position taken")
return
}

game.board[move-1] = "X"

// simple bot move
let empty = game.board
.map((v,i)=>v!=="X" && v!=="O" ? i : null)
.filter(v=>v!==null)

if(empty.length>0){
let botMove = empty[Math.floor(Math.random()*empty.length)]
game.board[botMove] = "O"
}

let b = game.board

let board = `
${b[0]} | ${b[1]} | ${b[2]}
---------
${b[3]} | ${b[4]} | ${b[5]}
---------
${b[6]} | ${b[7]} | ${b[8]}
`

message.reply(board)

}
