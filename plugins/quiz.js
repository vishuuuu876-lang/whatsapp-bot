import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

/* Decode HTML entities from opentdb API */
function decodeHTML(str) {
    return str
        .replace(/&amp;/g,  "&")
        .replace(/&lt;/g,   "<")
        .replace(/&gt;/g,   ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&ldquo;/g, "\u201C")
        .replace(/&rdquo;/g, "\u201D")
}

/* fix: fetch with a hard timeout so the handler never hangs silently */
async function fetchWithTimeout(url, timeoutMs = 8000) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const res = await fetch(url, { signal: controller.signal })
        return res
    } finally {
        clearTimeout(timer)
    }
}

export default async function(client, message, args){

    const input = message.body.toLowerCase().trim()
    const chat  = message.from
    const sender = message.author || message.from
    const mode  = args[0] || "single"

    /* EXIT */
    if(input === ".exit"){
        endGame(chat)
        return message.reply("❌ Quiz ended")
    }

    /* RESTART */
    if(input === ".restart"){
        if(games[chat]){
            games[chat].data = {}
            return message.reply("🔄 Quiz restarted — send any message for a new question")
        }
        return message.reply("❌ No quiz running. Send .quiz to start.")
    }

    /* CREATE GAME */
    if(!games[chat]){

        createGame(chat, "quiz", sender, mode)

        if(mode === "multi"){
            return message.reply(
                `🧠 Quiz Lobby\n\n.join to join\n.start to begin`
            )
        }

        startGame(chat, sender)
    }

    let game = games[chat]
    if(!game.data) game.data = {}

    /* JOIN */
    if(input === ".join"){
        const result = joinGame(chat, sender)
        if(result === "already-joined") return message.reply("⚠️ You already joined")
        return message.reply(`Player joined (${game.players.length})`)
    }

    /* START (multi) */
    if(input === ".start"){
        if(sender !== game.host) return message.reply("❌ Only the host can start")
        const result = startGame(chat, sender)
        if(result !== "started") return message.reply("⚠️ Could not start")
        // fall through to fetch question
    }

    if(!game.started) return

    /* IGNORE OTHER COMMANDS */
    if(input.startsWith(".")) return

    /* ASK QUESTION */
    if(!game.data.answer){

        try {

            await message.reply("🧠 Fetching question...")

            // fix: 8 second timeout — opentdb can hang indefinitely without this
            const res = await fetchWithTimeout(
                "https://opentdb.com/api.php?amount=1&type=multiple",
                8000
            )

            if(!res.ok){
                endGame(chat)
                return message.reply("❌ Quiz API unavailable. Try again later.\nGame ended.")
            }

            const data = await res.json()

            // fix: opentdb returns response_code 5 when rate limited
            if(data.response_code === 5){
                endGame(chat)
                return message.reply("❌ Too many requests to quiz API. Wait 10 seconds and try .quiz again.\nGame ended.")
            }

            if(!data.results || data.results.length === 0){
                endGame(chat)
                return message.reply("❌ No questions returned. Try .quiz again.\nGame ended.")
            }

            const q = data.results[0]

            const question       = decodeHTML(q.question)
            const correctAnswer  = decodeHTML(q.correct_answer)
            const wrongAnswers   = q.incorrect_answers.map(decodeHTML)

            game.data.answer = correctAnswer.toLowerCase()

            const options = [...wrongAnswers, correctAnswer]
                .sort(() => Math.random() - 0.5)
                .map(decodeHTML)

            await message.reply(
`🧠 *Quiz*

${question}

${options.join("\n")}

━━━━━━━━━━━━━━
▶ .restart — new question
▶ .exit — end quiz
━━━━━━━━━━━━━━`
            )

        } catch(err) {

            endGame(chat)

            if(err.name === "AbortError"){
                console.error("Quiz fetch timed out")
                return message.reply("❌ Quiz API timed out. Try .quiz again.")
            }

            console.error("Quiz fetch error:", err.message)
            return message.reply("❌ Failed to fetch question. Try .quiz again.")
        }

        return
    }

    /* CHECK ANSWER */
    if(game.mode === "multi" && !game.players.includes(sender)) return

    const correct = game.data.answer

    if(input === correct){

        await message.reply(
            `🎉 ${sender.split("@")[0]} got it right!\nAnswer: ${correct}`
        )

        // next question
        game.data.answer = null

    } else {
        return message.reply("❌ Wrong answer, try again")
    }

}
