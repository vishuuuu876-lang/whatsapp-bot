import { games, createGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName, send } from "../helpers.js"

function checkWinner(board, mark) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    return wins.some(combo => combo.every(i => board[i] === mark))
}

function formatBoard(board) {
    return (
        `${board[0]} | ${board[1]} | ${board[2]}\n` +
        `---------\n` +
        `${board[3]} | ${board[4]} | ${board[5]}\n` +
        `---------\n` +
        `${board[6]} | ${board[7]} | ${board[8]}`
    )
}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    if(!games[chat]){
        createGame(chat, "tictactoe", sender, "single")
        startGame(chat, sender)
        const game       = games[chat]
        game.data.board  = ["1","2","3","4","5","6","7","8","9"]
        game.data.player = sender
        const header = group ? `@${getName(sender)} vs Bot` : `You vs Bot`
        await send(client, message,
`🎮 *Tic Tac Toe*
${header}

${formatBoard(game.data.board)}

Send a number (1-9) to play
*.restart* reset | *.end* quit | *.help* commands`,
        [sender], group)
        return
    }

    let game = games[chat]

    if(group && sender !== game.data.player){
        await send(client, message,
            `⚠️ @${getName(game.data.player)} is playing! Wait or they can type *.end*`,
            [game.data.player], group)
        return
    }

    if(input === ".help") return message.reply(`🎮 *Tictactoe*\n1-9 place move\n*.restart* reset\n*.end* quit\n\n${formatBoard(game.data?.board || ["1","2","3","4","5","6","7","8","9"])}`)
    if(input === ".restart"){ game.data.board = ["1","2","3","4","5","6","7","8","9"]; return message.reply(`🔄 Reset!\n\n${formatBoard(game.data.board)}\n\nSend 1-9`) }
    if(input.startsWith(".")) return

    if(!game.data?.board){ game.data.board = ["1","2","3","4","5","6","7","8","9"]; return message.reply(`♻️ Reset\n\n${formatBoard(game.data.board)}`) }

    const move = parseInt(input)
    if(isNaN(move) || move < 1 || move > 9) return message.reply("⚠️ Send a number 1-9")

    let board = game.data.board
    if(board[move-1] === "X" || board[move-1] === "O") return message.reply("❌ Spot taken — pick another")

    board[move-1] = "X"

    if(checkWinner(board, "X")){
        const text = group ? `🎉 @${getName(sender)} wins!\n\n${formatBoard(board)}\n\nType *.tictactoe* again` : `🎉 You win!\n\n${formatBoard(board)}\n\nType *.tictactoe* again`
        await send(client, message, text, [sender], group)
        endGame(chat); return
    }
    if(board.every(v => v==="X"||v==="O")){ await message.reply(`🤝 Draw!\n\n${formatBoard(board)}`); endGame(chat); return }

    const empty = board.map((v,i)=>(v!=="X"&&v!=="O")?i:null).filter(v=>v!==null)
    const botMove = empty[Math.floor(Math.random()*empty.length)]
    board[botMove] = "O"

    if(checkWinner(board, "O")){ await message.reply(`🤖 Bot wins!\n\n${formatBoard(board)}`); endGame(chat); return }
    if(board.every(v=>v==="X"||v==="O")){ await message.reply(`🤝 Draw!\n\n${formatBoard(board)}`); endGame(chat); return }

    return message.reply(`${formatBoard(board)}\n\nYour turn (1-9)`)
}
