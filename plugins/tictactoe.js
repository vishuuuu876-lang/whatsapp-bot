import { games, createGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName } from "../helpers.js"

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

    /* CREATE GAME */
    if(!games[chat]){

        createGame(chat, "tictactoe", sender, "single")
        startGame(chat, sender)

        const game       = games[chat]
        game.data.board  = ["1","2","3","4","5","6","7","8","9"]
        game.data.player = sender

        const header = group
            ? `@${getName(sender)} ✖ vs 🤖 Bot`
            : `You ✖ vs 🤖 Bot`

        const text =
`🎮 *Tic Tac Toe*
${header}

${formatBoard(game.data.board)}

━━━━━━━━━━━━━━
📖 Send a number (1-9) to place your mark
🕹 *.restart* — reset board
🕹 *.help* — show commands
🕹 *.end* — quit game
━━━━━━━━━━━━━━`

        if(group){
            await message.reply(text, { mentions: [sender] })
        } else {
            await message.reply(text)
        }
        return
    }

    let game = games[chat]

    /* IN GROUP — only the player who started can play */
    if(group && sender !== game.data.player){
        const text = `⚠️ @${getName(game.data.player)} is currently playing!\nWait for them to finish or type *.end* to cancel`
        await message.reply(text, { mentions: [game.data.player] })
        return
    }

    /* HELP */
    if(input === ".help"){
        return message.reply(
`🎮 *Tictactoe Commands*

1-9 — place your move
*.restart* — reset the board
*.end* — quit the game

${formatBoard(game.data?.board || ["1","2","3","4","5","6","7","8","9"])}`)
    }

    /* RESTART */
    if(input === ".restart"){
        game.data.board = ["1","2","3","4","5","6","7","8","9"]
        return message.reply(`🔄 *Board reset!*\n\n${formatBoard(game.data.board)}\n\nSend a number (1-9)`)
    }

    if(input.startsWith(".")) return

    /* SAFETY GUARD */
    if(!game.data || !game.data.board){
        game.data.board = ["1","2","3","4","5","6","7","8","9"]
        return message.reply(`♻️ Board reset\n\n${formatBoard(game.data.board)}\n\nSend a number (1-9)`)
    }

    const move = parseInt(input)

    if(isNaN(move) || move < 1 || move > 9)
        return message.reply("⚠️ Send a number 1-9\nType *.help* to see commands")

    let board = game.data.board

    if(board[move-1] === "X" || board[move-1] === "O")
        return message.reply("❌ That spot is taken — pick another number")

    /* PLAYER MOVE */
    board[move-1] = "X"

    if(checkWinner(board, "X")){
        if(group){
            await message.reply(`🎉 @${getName(sender)} wins!\n\n${formatBoard(board)}\n\nType *.tictactoe* to play again`, { mentions: [sender] })
        } else {
            await message.reply(`🎉 *You win!*\n\n${formatBoard(board)}\n\nType *.tictactoe* to play again`)
        }
        endGame(chat)
        return
    }

    if(board.every(v => v === "X" || v === "O")){
        await message.reply(`🤝 *Draw!*\n\n${formatBoard(board)}\n\nType *.tictactoe* to play again`)
        endGame(chat)
        return
    }

    /* BOT MOVE */
    const empty   = board.map((v,i) => (v !== "X" && v !== "O") ? i : null).filter(v => v !== null)
    const botMove = empty[Math.floor(Math.random() * empty.length)]
    board[botMove] = "O"

    if(checkWinner(board, "O")){
        await message.reply(`🤖 *Bot wins!*\n\n${formatBoard(board)}\n\nType *.tictactoe* to play again`)
        endGame(chat)
        return
    }

    if(board.every(v => v === "X" || v === "O")){
        await message.reply(`🤝 *Draw!*\n\n${formatBoard(board)}\n\nType *.tictactoe* to play again`)
        endGame(chat)
        return
    }

    return message.reply(`${formatBoard(board)}\n\nYour turn — send a number (1-9)`)
}
