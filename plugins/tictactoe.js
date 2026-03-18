import { games, createGame, startGame, endGame } from "../games/engine.js"

/* CHECK WINNER HELPER */
function checkWinner(board, mark) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diagonals
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

export default async function (client, message, args) {

    const input = message.body.toLowerCase().trim()
    const chat = message.from
    const sender = message.author || message.from

    /* CREATE GAME — fix: was missing entirely */
    if (!games[chat]) {

        createGame(chat, "tictactoe", sender, "single")
        startGame(chat, sender)

        let game = games[chat]

        // fix: initialize board on creation so first move never crashes
        game.data.board = ["1","2","3","4","5","6","7","8","9"]

        return message.reply(
            `🎮 Tic Tac Toe\n\n${formatBoard(game.data.board)}\n\nSend a number (1-9)`
        )
    }

    let game = games[chat]

    /* RESTART */
    if (input === ".restart") {
        game.data = {
            board: ["1","2","3","4","5","6","7","8","9"]
        }
        return message.reply(`🔄 Game restarted!\n\n${formatBoard(game.data.board)}\n\nSend a number (1-9)`)
    }

    /* IGNORE OTHER COMMANDS */
    if (input.startsWith(".")) return

    /* STOP IF NO BOARD — safety guard */
    if (!game.data || !game.data.board) {
        game.data = { board: ["1","2","3","4","5","6","7","8","9"] }
        return message.reply(`♻️ Board reset\n\n${formatBoard(game.data.board)}\n\nSend a number (1-9)`)
    }

    /* PARSE MOVE */
    const move = parseInt(input)

    if (isNaN(move) || move < 1 || move > 9) {
        return message.reply("⚠️ Send a number between 1-9")
    }

    let board = game.data.board

    if (board[move - 1] === "X" || board[move - 1] === "O") {
        return message.reply("❌ Position already taken")
    }

    /* PLAYER MOVE */
    board[move - 1] = "X"

    /* CHECK PLAYER WIN */
    if (checkWinner(board, "X")) {
        await message.reply(`🎉 You win!\n\n${formatBoard(board)}`)
        endGame(chat)
        return
    }

    /* DRAW BEFORE BOT */
    if (board.every(v => v === "X" || v === "O")) {
        await message.reply(`🤝 It's a draw!\n\n${formatBoard(board)}`)
        endGame(chat)
        return
    }

    /* BOT MOVE */
    const empty = board
        .map((v, i) => (v !== "X" && v !== "O") ? i : null)
        .filter(v => v !== null)

    const botMove = empty[Math.floor(Math.random() * empty.length)]
    board[botMove] = "O"

    /* CHECK BOT WIN */
    if (checkWinner(board, "O")) {
        await message.reply(`🤖 Bot wins!\n\n${formatBoard(board)}`)
        endGame(chat)
        return
    }

    /* DRAW AFTER BOT */
    if (board.every(v => v === "X" || v === "O")) {
        await message.reply(`🤝 It's a draw!\n\n${formatBoard(board)}`)
        endGame(chat)
        return
    }

    /* SHOW BOARD */
    return message.reply(formatBoard(board))
}
