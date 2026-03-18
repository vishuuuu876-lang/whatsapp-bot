import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

/* Fix: decode HTML entities from opentdb API (e.g. &amp; &#039;) */
function decodeHTML(str) {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&ldquo;/g, "\u201C")
        .replace(/&rdquo;/g, "\u201D")
}

export default async function (client, message, args) {

    const input = message.body.toLowerCase().trim()
    const chat = message.from
    const sender = message.author || message.from
    const mode = args[0] || "single"

    /* EXIT */
    if (input === ".exit") {
        endGame(chat)
        return message.reply("❌ Quiz ended")
    }

    /* RESTART */
    if (input === ".restart") {
        if (games[chat]) {
            games[chat].data = {}
            return message.reply("🔄 Quiz restarted — next message triggers a new question")
        }
    }

    /* CREATE GAME */
    if (!games[chat]) {

        createGame(chat, "quiz", sender, mode)

        if (mode === "multi") {
            return message.reply(
                `🧠 Quiz Lobby\n\n.join to join\n.start to begin`
            )
        }

        startGame(chat, sender)
    }

    let game = games[chat]
    if (!game.data) game.data = {}

    /* JOIN */
    if (input === ".join") {
        const result = joinGame(chat, sender)
        if (result === "already-joined") return message.reply("⚠️ You already joined")
        return message.reply(`Player joined (${game.players.length})`)
    }

    /* START (multi) */
    if (input === ".start") {
        if (sender !== game.host) return message.reply("❌ Only the host can start")
        const result = startGame(chat, sender)
        if (result !== "started") return message.reply("⚠️ Could not start")
        // fall through to ask question below
    }

    if (!game.started) return

    /* IGNORE OTHER COMMANDS */
    if (input.startsWith(".")) return

    /* ASK QUESTION */
    if (!game.data.answer) {

        try {
            const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple")

            if (!res.ok) throw new Error("API error")

            const data = await res.json()

            // fix: guard against empty results from opentdb rate limiting
            if (!data.results || data.results.length === 0) {
                return message.reply("❌ Could not fetch question, try again in a moment")
            }

            const q = data.results[0]

            // fix: decode HTML entities so questions display cleanly in WhatsApp
            const question = decodeHTML(q.question)
            const correctAnswer = decodeHTML(q.correct_answer)
            const incorrectAnswers = q.incorrect_answers.map(decodeHTML)

            game.data.answer = correctAnswer.toLowerCase()

            const options = [...incorrectAnswers, correctAnswer]
                .sort(() => Math.random() - 0.5)
                .map(decodeHTML)

            await message.reply(
                `🧠 Quiz\n\n${question}\n\n${options.join("\n")}\n\n━━━━━━━━━━━━━━\n▶ Commands:\n.restart\n.exit\n━━━━━━━━━━━━━━`
            )

        } catch (err) {
            console.error("Quiz fetch error:", err)
            return message.reply("❌ Failed to fetch question, try again")
        }

        return
    }

    if (game.mode === "multi" && !game.players.includes(sender)) return

    /* CHECK ANSWER */
    const correct = game.data.answer

    // fix: exact match only — previous loose match accepted almost anything
    if (input === correct) {

        await message.reply(`🎉 ${sender.split("@")[0]} got it right!\nAnswer: ${correct}`)

        // next question
        game.data.answer = null

    } else {
        return message.reply("❌ Wrong answer, try again")
    }
}
