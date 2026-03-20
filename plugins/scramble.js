import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName, send } from "../helpers.js"

export const pendingMode = {}

async function fetchWithTimeout(url, ms = 8000) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), ms)
    try { return await fetch(url, { signal: ctrl.signal }) }
    finally { clearTimeout(t) }
}

async function fetchWord(client, message, game, chat, group) {
    await message.reply("🔤 Fetching word...")
    try {
        const res = await fetchWithTimeout("https://random-word-api.herokuapp.com/word")
        if(!res.ok) throw new Error("API error")
        const data = await res.json()
        if(!data?.[0]) throw new Error("Empty")
        const word = data[0]
        let scrambled = word
        for(let i=0;i<10;i++){ const t=word.split("").sort(()=>Math.random()-0.5).join(""); if(t!==word){scrambled=t;break} }
        game.data.word = word
        await message.reply(`🔤 *Unscramble:*\n\n*${scrambled}*\n\n${group?"First to type the correct word wins!":"Type the correct word to win!"}\n*.hint* — hint | *.end* — quit`)
    } catch(err) {
        endGame(chat)
        if(err.name==="AbortError") return message.reply("❌ API timed out. Try *.scramble* again.")
        return message.reply("❌ Failed to fetch word. Try *.scramble* again.")
    }
}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    if(!games[chat] && !pendingMode[chat]){
        if(args[0]==="single"||args[0]==="multi"){
            // skip menu
        } else {
            pendingMode[chat] = { type: "scramble" }
            return message.reply(group
                ? `🔤 *Word Scramble*\n\n1️⃣ Single player\n2️⃣ Multiplayer\n\nReply 1 or 2 | 0 to cancel`
                : `🔤 *Word Scramble*\n\n1️⃣ Single player\n\n_Multiplayer only in groups_\nReply 1 | 0 to cancel`)
        }
    }

    if(pendingMode[chat]?.type === "scramble" && !games[chat]){
        if(input==="0"){ delete pendingMode[chat]; return message.reply("👋 Cancelled") }
        else if(input==="1"||input==="single"){ delete pendingMode[chat]; args[0]="single" }
        else if(input==="2"||input==="multi"){
            delete pendingMode[chat]
            if(!group) return message.reply("⚠️ Multiplayer only in groups!\nReply 1 for solo or 0 to cancel")
            args[0]="multi"
        } else if(input.startsWith(".")){ delete pendingMode[chat] }
        else return message.reply("⚠️ Reply 1 or 2 | 0 to cancel")
    }

    const mode = args[0] || "single"

    if(!games[chat] && (mode==="single"||mode==="multi")){
        if(mode==="multi"&&!group) return message.reply("⚠️ Multiplayer only in group chats!")
        createGame(chat, "scramble", sender, mode)
        if(mode==="multi"){
            await send(client, message, `🔤 *Scramble Multiplayer*\nBy @${getName(sender)}\n\n*.join* *.start* *.end*`, [sender], group)
            return
        }
        startGame(chat, sender)
        const game = games[chat]
        if(!game.data) game.data = {}
        await fetchWord(client, message, game, chat, group)
        return
    }

    let game = games[chat]
    if(!game) return
    if(!game.data) game.data = {}

    if(input===".help") return message.reply(game.started ? `🔤 Type word to win\n*.hint* *.end*` : `🔤 *.join* *.start* *.end*`)

    if(input===".join"){
        if(!group) return message.reply("❌ Join is for group multiplayer only")
        if(game.players.includes(sender)) return send(client, message, `⚠️ @${getName(sender)} already joined!`, [sender], group)
        const result = joinGame(chat, sender)
        if(result==="player-limit") return message.reply("❌ Game is full")
        if(result==="already-started") return message.reply("❌ Already started")
        await send(client, message, `✅ @${getName(sender)} joined! (${game.players.length})\n@${getName(game.host)} send *.start* when ready`, [sender, game.host], group)
        return
    }

    if(input===".start"){
        if(sender!==game.host) return send(client, message, group?`❌ Only @${getName(game.host)} can start`:"❌ Only host can start", [game.host], group)
        if(game.mode==="multi"&&game.players.length<2) return message.reply("❌ Need at least 2 players")
        const result = startGame(chat, sender)
        if(result!=="started") return message.reply("⚠️ Could not start")
        await fetchWord(client, message, game, chat, group)
        return
    }

    if(input===".hint"){
        if(!game.data.word) return message.reply("⏳ Not started yet")
        return message.reply(`💡 First letter: *${game.data.word[0].toUpperCase()}* | Length: *${game.data.word.length}*`)
    }

    if(!game.started) return
    if(!game.data.word) return
    if(input.startsWith(".")) return
    if(game.mode==="multi"&&!game.players.includes(sender)) return

    if(input===game.data.word){
        const text = group ? `🎉 @${getName(sender)} solved it!\nWord: *${game.data.word}*\n\nType *.scramble* again` : `🎉 Correct!\nWord: *${game.data.word}*\n\nType *.scramble* again`
        await send(client, message, text, [sender], group)
        endGame(chat)
    } else {
        await message.reply("❌ Not quite — try again!\n*.hint* for help")
    }
}
