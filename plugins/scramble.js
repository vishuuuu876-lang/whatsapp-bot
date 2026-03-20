import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"
import { send, isGroup, getSender, getName } from "../gameHelpers.js"

const pendingMode = {}

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

async function fetchWord(client, message, game, chat) {
    const group = isGroup(message)
    await message.reply("🔤 Fetching word...")
    try {
        const res = await fetchWithTimeout("https://random-word-api.herokuapp.com/word", 8000)
        if(!res.ok) throw new Error("API error")
        const data = await res.json()
        if(!data || !data[0]) throw new Error("Empty response")

        const word = data[0]
        let scrambled = word
        for(let i = 0; i < 10; i++){
            const temp = word.split("").sort(() => Math.random() - 0.5).join("")
            if(temp !== word){ scrambled = temp; break }
        }
        game.data.word = word

        await message.reply(
`🔤 *Unscramble this word:*

*${scrambled}*

━━━━━━━━━━━━━━
📖 ${group ? "First to type the correct word wins!" : "Type the correct word to win!"}

🕹 *.hint* — first letter & length
🕹 *.help* — commands
🕹 *.end* — quit
━━━━━━━━━━━━━━`)

    } catch(err) {
        endGame(chat)
        if(err.name === "AbortError")
            return message.reply("❌ Word API timed out. Try *.scramble* again.")
        console.error("Scramble error:", err.message)
        return message.reply("❌ Failed to fetch word. Try *.scramble* again.")
    }
}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    /* MODE SELECTION MENU */
    if(!games[chat] && !pendingMode[chat]){
        if(args[0] === "single" || args[0] === "multi" || args[0] === "solo"){
            // skip menu
        } else {
            pendingMode[chat] = true
            if(group){
                return message.reply(
`🔤 *Word Scramble*

Choose a mode:

1️⃣ *Single player* — just you vs the word
2️⃣ *Multiplayer* — race with group members

_Reply 1 or 2 — Reply 0 to cancel_`)
            } else {
                return message.reply(
`🔤 *Word Scramble*

1️⃣ *Single player* — unscramble the word

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

Add the bot to a group to play with friends.
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

Add the bot to a group to play with friends.
Type *.scramble* again to play solo.`)
        }

        createGame(chat, "scramble", sender, mode)

        if(mode === "multi"){
            await send(client, message,
`🔤 *Word Scramble — Multiplayer*
Started by @${getName(sender)}

━━━━━━━━━━━━━━
🕹 *.join* — join the game
🕹 *.start* — begin (host only)
🕹 *.end* — cancel
━━━━━━━━━━━━━━`,
            [sender])
            return
        }

        startGame(chat, sender)
        const game = games[chat]
        if(!game.data) game.data = {}
        await fetchWord(client, message, game, chat)
        return
    }

    let game = games[chat]
    if(!game) return
    if(!game.data) game.data = {}

    /* HELP */
    if(input === ".help"){
        if(!game.started){
            return message.reply(
`🔤 *Scramble Lobby Commands*
*.join* — join
*.start* — begin (host only)
*.end* — cancel`)
        }
        return message.reply(
`🔤 *Scramble Commands*
Type the correct word to win
*.hint* — first letter & length
*.end* — quit`)
    }

    /* JOIN */
    if(input === ".join"){
        if(!group) return message.reply("❌ Join is only for group multiplayer games")
        if(game.players.includes(sender)){
            await send(client, message, `⚠️ @${getName(sender)} you already joined!`, [sender])
            return
        }
        const result = joinGame(chat, sender)
        if(result === "player-limit")    return message.reply("❌ Game is full")
        if(result === "already-started") return message.reply("❌ Game already started")

        await send(client, message,
`✅ @${getName(sender)} joined! (${game.players.length} players)

@${getName(game.host)} send *.start* when ready`,
        [sender, game.host])
        return
    }

    /* START */
    if(input === ".start"){
        if(sender !== game.host){
            await send(client, message,
                group ? `❌ Only @${getName(game.host)} can start` : "❌ Only the host can start",
                [game.host])
            return
        }
        if(game.mode === "multi" && game.players.length < 2)
            return message.reply("❌ Need at least 2 players — others should send *.join* first")

        const result = startGame(chat, sender)
        if(result !== "started") return message.reply("⚠️ Could not start")

        await fetchWord(client, message, game, chat)
        return
    }

    /* HINT */
    if(input === ".hint"){
        if(!game.data.word) return message.reply("⏳ Game hasn't started yet")
        return message.reply(
`💡 *Hint:*
First letter: *${game.data.word[0].toUpperCase()}*
Word length: *${game.data.word.length} letters*`)
    }

    if(!game.started) return
    if(!game.data.word) return
    if(input.startsWith(".")) return
    if(game.mode === "multi" && !game.players.includes(sender)) return

    /* CHECK ANSWER */
    if(input === game.data.word){
        await send(client, message,
            group
                ? `🎉 @${getName(sender)} solved it!\nWord: *${game.data.word}*\n\nType *.scramble* to play again`
                : `🎉 Correct!\nWord: *${game.data.word}*\n\nType *.scramble* to play again`,
            [sender])
        endGame(chat)
    } else {
        await message.reply("❌ Not quite — try again!\nType *.hint* if you need help")
    }
                                                      }
