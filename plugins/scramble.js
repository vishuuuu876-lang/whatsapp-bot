import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

export default async function (client, message, args) {

    const input = message.body.toLowerCase().trim()
    const chat = message.from
    const sender = message.author || message.from
    const mode = args[0] || "single"

    /* CREATE GAME */
    if (!games[chat]) {

        createGame(chat, "scramble", sender, mode)

        if (mode === "multi") {
            return message.reply(
                `🔤 Word Scramble Lobby\n\n.join to join\n.start to begin`
            )
        }

        // fix: only call startGame once for single mode
        startGame(chat, sender)
    }

    let game = games[chat]
    if (!game.data) game.data = {}

    /* JOIN */
    if (input === ".join") {
        const result = joinGame(chat, sender)
        if (result === "already-joined") return message.reply("⚠️ You already joined")
        if (result === "player-limit") return message.reply("❌ Game is full")
        return message.reply(`Player joined (${game.players.length})`)
    }

    /* START */
    if (input.startsWith(".start")) {

        if (sender !== game.host)
            return message.reply("❌ Only the host can start")

        if (game.mode === "multi") {
            const result = startGame(chat, sender)
            if (result !== "started") return message.reply("⚠️ Could not start game")
        }

        try {
            const res = await fetch("https://random-word-api.herokuapp.com/word")

            // fix: guard against non-ok API responses
            if (!res.ok) throw new Error("API error")

            const data = await res.json()
            const word = data[0]

            let scrambled = word
            for (let i = 0; i < 10; i++) {
                const temp = word.split("").sort(() => Math.random() - 0.5).join("")
                if (temp !== word) {
                    scrambled = temp
                    break
                }
            }

            game.data.word = word

            await message.reply(`🔤 Unscramble this word:\n\n${scrambled}`)

        } catch {
            // fix: end the game cleanly so it doesn't stay open with no word
            endGame(chat)
            await message.reply("❌ Failed to fetch word. Game cancelled, try again.")
        }

        return
    }

    /* GAME INPUT */
    if (!game.started) return

    if (!game.data.word) {
        return message.reply("⏳ Waiting for the game to start...")
    }

    if (game.mode === "multi" && !game.players.includes(sender)) return

    // fix: ignore commands during gameplay
    if (input.startsWith(".")) return

    const guess = input

    if (guess === game.data.word) {
        await message.reply(
            `🎉 ${sender.split("@")[0]} solved it!\nWord: ${game.data.word}`
        )
        endGame(chat)
    }
}
