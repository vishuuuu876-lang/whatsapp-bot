import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName, send } from "../helpers.js"

export const pendingMode = {}

function decodeHTML(str) {
    return str.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&ldquo;/g,"\u201C").replace(/&rdquo;/g,"\u201D")
}

async function fetchWithTimeout(url, ms = 8000) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), ms)
    try { return await fetch(url, { signal: ctrl.signal }) }
    finally { clearTimeout(t) }
}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    if(input===".exit"||input===".end"){ delete pendingMode[chat]; endGame(chat); return message.reply("❌ Quiz ended\n\nType *.quiz* to play again") }
    if(input===".restart"&&games[chat]){ games[chat].data={}; return message.reply("🔄 Skipped — send any message for next question") }
    if(input===".help") return message.reply(games[chat]&&!games[chat].started ? `🧠 *.join* *.start* *.end*` : `🧠 Type answer | *.restart* skip | *.end* quit`)

    if(!games[chat] && !pendingMode[chat]){
        if(args[0]==="single"||args[0]==="multi"){
            // skip menu
        } else {
            pendingMode[chat] = { type: "quiz" }
            return message.reply(group
                ? `🧠 *Quiz*\n\n1️⃣ Single player\n2️⃣ Multiplayer\n\nReply 1 or 2 | 0 to cancel`
                : `🧠 *Quiz*\n\n1️⃣ Single player\n\n_Multiplayer only in groups_\nReply 1 | 0 to cancel`)
        }
    }

    if(pendingMode[chat]?.type==="quiz" && !games[chat]){
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
        createGame(chat, "quiz", sender, mode)
        if(mode==="multi"){
            await send(client, message, `🧠 *Quiz Multiplayer*\nBy @${getName(sender)}\n\n*.join* *.start* *.end*\n_First to answer wins!_`, [sender], group)
            return
        }
        startGame(chat, sender)
        return message.reply(`🧠 *Quiz — Solo*\n\n*.restart* skip | *.end* quit\n\n_Send any message to get first question!_`)
    }

    let game = games[chat]
    if(!game) return
    if(!game.data) game.data = {}

    if(input===".join"){
        if(!group) return message.reply("❌ Join is for group multiplayer only")
        if(game.players.includes(sender)) return send(client, message, `⚠️ @${getName(sender)} already joined!`, [sender], group)
        const result = joinGame(chat, sender)
        if(result==="already-started") return message.reply("❌ Already started")
        await send(client, message, `✅ @${getName(sender)} joined! (${game.players.length})\n@${getName(game.host)} send *.start* when ready`, [sender, game.host], group)
        return
    }

    if(input===".start"){
        if(sender!==game.host) return send(client, message, group?`❌ Only @${getName(game.host)} can start`:"❌ Only host can start", [game.host], group)
        if(game.mode==="multi"&&game.players.length<2) return message.reply("❌ Need at least 2 players")
        const result = startGame(chat, sender)
        if(result!=="started") return message.reply("⚠️ Could not start")
        const names = game.players.map(p=>`@${getName(p)}`).join(", ")
        await send(client, message, `🧠 *Quiz Started!*\n\nPlayers: ${names}\n\nFirst to answer wins!\n*.restart* skip | *.end* quit\n\n_Send any message for first question!_`, game.players, group)
        return
    }

    if(!game.started) return
    if(game.mode==="multi"&&!game.players.includes(sender)) return
    if(input.startsWith(".")) return

    if(!game.data.answer){
        try {
            await message.reply("🧠 Fetching question...")
            const res = await fetchWithTimeout("https://opentdb.com/api.php?amount=1&type=multiple")
            if(!res.ok){ endGame(chat); return message.reply("❌ API unavailable. Try *.quiz* again.") }
            const data = await res.json()
            if(data.response_code===5){ endGame(chat); return message.reply("❌ Too many requests. Wait and try *.quiz* again.") }
            if(!data.results?.length){ endGame(chat); return message.reply("❌ No questions. Try *.quiz* again.") }

            const q = data.results[0]
            const question = decodeHTML(q.question)
            const correct  = decodeHTML(q.correct_answer)
            const wrong    = q.incorrect_answers.map(decodeHTML)
            game.data.answer = correct.toLowerCase()
            const options = [...wrong, correct].sort(()=>Math.random()-0.5).map(decodeHTML)

            await message.reply(`🧠 *Question*\n\n${question}\n\n${options.join("\n")}\n\n━━━━━━━━━━━━━━\nType answer | *.restart* skip | *.end* quit`)
        } catch(err) {
            endGame(chat)
            if(err.name==="AbortError") return message.reply("❌ Timed out. Try *.quiz* again.")
            return message.reply("❌ Failed. Try *.quiz* again.")
        }
        return
    }

    if(input===game.data.answer){
        const text = group ? `🎉 @${getName(sender)} got it!\n✅ ${game.data.answer}\n\n_Send any message for next question_` : `🎉 Correct!\n✅ ${game.data.answer}\n\n_Send any message for next question_`
        await send(client, message, text, [sender], group)
        game.data.answer = null
    } else {
        return message.reply("❌ Wrong — try again!")
    }
               }
