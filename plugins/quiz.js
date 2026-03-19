import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName } from "../helpers.js"

const pendingMode = {}

function decodeHTML(str) {
    return str
        .replace(/&amp;/g,   "&")
        .replace(/&lt;/g,    "<")
        .replace(/&gt;/g,    ">")
        .replace(/&quot;/g,  '"')
        .replace(/&#039;/g,  "'")
        .replace(/&ldquo;/g, "\u201C")
        .replace(/&rdquo;/g, "\u201D")
}

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

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    /* ALWAYS-ON COMMANDS */
    if(input === ".exit" || input === ".end"){
        delete pendingMode[chat]
        endGame(chat)
        return message.reply("❌ Quiz ended\n\nType *.quiz* to play again")
    }

    if(input === ".restart" && games[chat]){
        games[chat].data = {}
        return message.reply("🔄 Skipped — send any message to get next question")
    }

    if(input === ".help"){
        if(games[chat] && !games[chat].started){
            return message.reply(
`🧠 *Quiz Lobby Commands*
*.join* — join the quiz
*.start* — begin (host only)
*.end* — cancel`)
        }
        return message.reply(
`🧠 *Quiz Commands*
Type your answer to submit
*.restart* — skip question
*.end* — quit`)
    }

    /* MODE SELECTION */
    if(!games[chat] && !pendingMode[chat]){

        if(args[0] === "single" || args[0] === "multi" || args[0] === "solo"){
            // skip menu
        } else {
            pendingMode[chat] = true

            if(group){
                return message.reply(
`🧠 *Quiz*

Choose a mode:

1️⃣ *Single player* — solo trivia
2️⃣ *Multiplayer* — race with group members

_Reply 1 or 2 — Reply 0 to cancel_`)
            } else {
                return message.reply(
`🧠 *Quiz*

1️⃣ *Single player* — solo trivia challenge

_Multiplayer is only available in group chats_
_Reply 1 to start — Reply 0 to cancel_`)
            }
        }
    }

    /* HANDLE MODE REPLY */
    if(pendingMode[chat] && !games[chat]){
        if(input === "0"){
            delete pendingMode[chat]
            return message.reply("👋 Cancelled")
        } else if(input === "1" || input === "single" || input === "solo"){
            delete pendingMode[chat]
            args[0] = "single"
        } else if(input === "2" || input === "multi"){
            delete pendingMode[chat]
            if(!group){
                return message.reply(
`⚠️ *Multiplayer is only available in group chats!*

Add the bot to a WhatsApp group to compete with friends.
Reply *1* to play solo instead, or *0* to cancel`)
            }
            args[0] = "multi"
        } else if(input.startsWith(".")){
            delete pendingMode[chat]
        } else {
            return message.reply(
                group
                    ? "⚠️ Reply *1* for single or *2* for multiplayer\nReply *0* to cancel"
                    : "⚠️ Reply *1* to play solo\nReply *0* to cancel"
            )
        }
    }

    const mode = args[0] === "solo" ? "single" : (args[0] || "single")

    /* CREATE GAME */
    if(!games[chat] && (mode === "single" || mode === "multi")){

        if(mode === "multi" && !group){
            return message.reply(
`⚠️ *Multiplayer only works in group chats!*

Add the bot to a group to compete with friends.
Type *.quiz* again to play solo.`)
        }

        createGame(chat, "quiz", sender, mode)

        if(mode === "multi"){
            return message.reply(
`🧠 *Quiz — Multiplayer*
Started by @${getName(sender)}

━━━━━━━━━━━━━━
🕹 *.join* — join the quiz
🕹 *.start* — begin (host only)
🕹 *.end* — cancel

_First to answer each question wins the round!_
━━━━━━━━━━━━━━`,
            { mentions: [sender] }
            )
        }

        startGame(chat, sender)
        return message.reply(
`🧠 *Quiz — Solo Mode*

━━━━━━━━━━━━━━
🕹 *.restart* — skip question
🕹 *.end* — quit
━━━━━━━━━━━━━━
_Send any message to get your first question!_`)
    }

    let game = games[chat]
    if(!game) return
    if(!game.data) game.data = {}

    /* JOIN */
    if(input === ".join"){
        if(!group) return message.reply("❌ Join is only for group multiplayer games")
        if(game.players.includes(sender))
            return message.reply(`⚠️ @${getName(sender)} you already joined!`, { mentions: [sender] })

        const result = joinGame(chat, sender)
        if(result === "already-started") return message.reply("❌ Quiz already started")

        return message.reply(
`✅ @${getName(sender)} joined! (${game.players.length} players)

@${getName(game.host)} send *.start* when everyone is in`,
        { mentions: [sender, game.host] }
        )
    }

    /* START */
    if(input === ".start"){
        if(sender !== game.host)
            return message.reply(
                group ? `❌ Only @${getName(game.host)} can start` : "❌ Only the host can start",
                group ? { mentions: [game.host] } : {}
            )
        if(game.mode === "multi" && game.players.length < 2)
            return message.reply("❌ Need at least 2 players — others should send *.join* first")

        const result = startGame(chat, sender)
        if(result !== "started") return message.reply("⚠️ Could not start")

        const names = game.players.map(p => `@${getName(p)}`).join(", ")
        await message.reply(
`🧠 *Quiz Started!*

Players: ${names}

First to answer each question wins the round!
*.restart* — skip | *.end* — quit

_Send any message to load first question!_`,
        { mentions: game.players }
        )
        return
    }

    if(!game.started) return
    if(game.mode === "multi" && !game.players.includes(sender)) return
    if(input.startsWith(".")) return

    /* FETCH QUESTION */
    if(!game.data.answer){
        try {

            await message.reply("🧠 Fetching question...")

            const res = await fetchWithTimeout(
                "https://opentdb.com/api.php?amount=1&type=multiple",
                8000
            )

            if(!res.ok){
                endGame(chat)
                return message.reply("❌ Quiz API unavailable. Try *.quiz* again.")
            }

            const data = await res.json()

            if(data.response_code === 5){
                endGame(chat)
                return message.reply("❌ Too many requests. Wait a moment then try *.quiz* again.")
            }

            if(!data.results || !data.results.length){
                endGame(chat)
                return message.reply("❌ No questions returned. Try *.quiz* again.")
            }

            const q             = data.results[0]
            const question      = decodeHTML(q.question)
            const correctAnswer = decodeHTML(q.correct_answer)
            const wrongAnswers  = q.incorrect_answers.map(decodeHTML)

            game.data.answer = correctAnswer.toLowerCase()

            const options = [...wrongAnswers, correctAnswer]
                .sort(() => Math.random() - 0.5)
                .map(decodeHTML)

            await message.reply(
`🧠 *Quiz Question*

${question}

${options.join("\n")}

━━━━━━━━━━━━━━
Type your answer to submit
*.restart* — skip | *.end* — quit
━━━━━━━━━━━━━━`)

        } catch(err) {
            endGame(chat)
            if(err.name === "AbortError"){
                console.error("Quiz fetch timed out")
                return message.reply("❌ Quiz API timed out. Try *.quiz* again.")
            }
            console.error("Quiz fetch error:", err.message)
            return message.reply("❌ Failed to fetch question. Try *.quiz* again.")
        }
        return
    }

    /* CHECK ANSWER */
    if(input === game.data.answer){
        await message.reply(
            group
                ? `🎉 @${getName(sender)} got it right!\n✅ Answer: ${game.data.answer}\n\n_Send any message for next question_`
                : `🎉 Correct!\n✅ Answer: ${game.data.answer}\n\n_Send any message for next question_`,
            group ? { mentions: [sender] } : {}
        )
        game.data.answer = null
    } else {
        return message.reply("❌ Wrong answer — try again!\nType *.help* for commands")
    }
}
