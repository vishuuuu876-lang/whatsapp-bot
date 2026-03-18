import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

export default async function (client, message, args) {

    const input = message.body.toLowerCase().trim()
    const chat = message.from
    const sender = message.author || message.from
    const mode = args[0] || "single"

    /* CREATE GAME */
    if (!games[chat]) {

        createGame(chat, "rps", sender, mode)

        if (mode === "multi") {
            return message.reply(
                `✊ Rock Paper Scissors Lobby\n\n.join to join\n.start to begin (2 players max)`
            )
        }

        startGame(chat, sender)

        return message.reply(
            `✊ Rock Paper Scissors\n\nSend:\nrock\npaper\nscissors`
        )
    }

    // fix: declare game variable that was missing — this was the main crash cause
    let game = games[chat]

    /* JOIN */
    if (input === ".join") {

        if (game.players.length >= 2)
            return message.reply("❌ RPS only supports 2 players")

        const result = joinGame(chat, sender)
        if (result === "already-joined") return message.reply("⚠️ You already joined")

        return message.reply(`Player joined (${game.players.length}/2)`)
    }

    /* START */
    if (input === ".start") {

        if (sender !== game.host)
            return message.reply("❌ Only the host can start")

        if (game.mode === "multi" && game.players.length < 2)
            return message.reply("❌ Need 2 players to start")

        const result = startGame(chat, sender)
        if (result !== "started") return message.reply("⚠️ Could not start game")

        return message.reply(
            `✊ Rock Paper Scissors\n\nSend:\nrock\npaper\nscissors`
        )
    }

    /* GAME INPUT */
    if (!game.started) return

    if (game.mode === "multi" && !game.players.includes(sender)) return

    const options = ["rock", "paper", "scissors"]

    if (!options.includes(input)) {
        return message.reply("❌ Send: rock / paper / scissors")
    }

    /* SINGLE PLAYER */
    if (game.mode === "single") {

        const bot = options[Math.floor(Math.random() * 3)]

        if (input === bot) {
            await message.reply(`🤝 Draw!\nYou: ${input}\nBot: ${bot}`)
        } else if (
            (input === "rock" && bot === "scissors") ||
            (input === "paper" && bot === "rock") ||
            (input === "scissors" && bot === "paper")
        ) {
            await message.reply(`🎉 You win!\nBot chose: ${bot}`)
        } else {
            await message.reply(`🤖 Bot wins!\nBot chose: ${bot}`)
        }

        endGame(chat)
        return
    }

    /* MULTIPLAYER */
    if (!game.data) game.data = {}

    // fix: prevent a player from voting twice
    if (game.data[sender]) {
        return message.reply("⏳ Waiting for the other player...")
    }

    game.data[sender] = input

    if (Object.keys(game.data).length < 2) {
        return message.reply("✅ Choice locked in — waiting for opponent...")
    }

    const players = Object.keys(game.data)
    const p1 = game.data[players[0]]
    const p2 = game.data[players[1]]

    let result = "🤝 Draw"

    if (
        (p1 === "rock" && p2 === "scissors") ||
        (p1 === "paper" && p2 === "rock") ||
        (p1 === "scissors" && p2 === "paper")
    ) {
        result = `🏆 ${players[0].split("@")[0]} wins`
    } else if (p1 !== p2) {
        result = `🏆 ${players[1].split("@")[0]} wins`
    }

    await message.reply(
        `✊ RPS Result\n\n${players[0].split("@")[0]}: ${p1}\n${players[1].split("@")[0]}: ${p2}\n\n${result}`
    )

    endGame(chat)
}
