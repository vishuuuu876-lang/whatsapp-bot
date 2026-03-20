import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName, send } from "../helpers.js"

export const pendingMode = {}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    /* MODE SELECTION */
    if(!games[chat] && !pendingMode[chat]){
        if(args[0] === "single" || args[0] === "multi"){
            // skip menu
        } else {
            pendingMode[chat] = { type: "rps" }
            return message.reply(group
                ? `✊ *Rock Paper Scissors*\n\n1️⃣ Single player — vs bot\n2️⃣ Multiplayer — with group\n\nReply 1 or 2 | Reply 0 to cancel`
                : `✊ *Rock Paper Scissors*\n\n1️⃣ Single player — vs bot\n\n_Multiplayer only in groups_\nReply 1 to start | 0 to cancel`)
        }
    }

    if(pendingMode[chat]?.type === "rps" && !games[chat]){
        if(input === "0"){ delete pendingMode[chat]; return message.reply("👋 Cancelled") }
        else if(input === "1" || input === "single"){ delete pendingMode[chat]; args[0] = "single" }
        else if(input === "2" || input === "multi"){
            delete pendingMode[chat]
            if(!group) return message.reply("⚠️ Multiplayer only in group chats!\nReply 1 for solo or 0 to cancel")
            args[0] = "multi"
        } else if(input.startsWith(".")){ delete pendingMode[chat] }
        else return message.reply(group ? "⚠️ Reply 1 or 2\n0 to cancel" : "⚠️ Reply 1 to play\n0 to cancel")
    }

    const mode = args[0] || "single"

    if(!games[chat] && (mode === "single" || mode === "multi")){
        if(mode === "multi" && !group) return message.reply("⚠️ Multiplayer only in group chats!\nType *.rps* to play solo.")
        createGame(chat, "rps", sender, mode)

        if(mode === "multi"){
            await send(client, message, `✊ *RPS Multiplayer*\nStarted by @${getName(sender)}\n\n*.join* — join\n*.start* — start (host)\n*.end* — cancel`, [sender], group)
            return
        }
        startGame(chat, sender)
        return message.reply(`✊ *RPS vs Bot*\n\nSend: *rock* / *paper* / *scissors*\n*.end* to quit`)
    }

    let game = games[chat]
    if(!game) return

    if(input === ".help") return message.reply(game.started ? `✊ *rock* / *paper* / *scissors*\n*.end* quit` : `✊ *.join* *.start* *.end*`)

    if(input === ".join"){
        if(!group) return message.reply("❌ Join is for group multiplayer only")
        if(game.players.includes(sender)) return send(client, message, `⚠️ @${getName(sender)} already joined!`, [sender], group)
        if(game.players.length >= 2) return message.reply("❌ Game is full")
        const result = joinGame(chat, sender)
        if(result === "already-started") return message.reply("❌ Already started")
        const ready = game.players.length === 2
        await send(client, message, `✅ @${getName(sender)} joined! (${game.players.length}/2)\n${ready ? `Both ready! @${getName(game.host)} send *.start*` : "Waiting for one more..."}`, ready ? [sender, game.host] : [sender], group)
        return
    }

    if(input === ".start"){
        if(sender !== game.host) return send(client, message, group ? `❌ Only @${getName(game.host)} can start` : "❌ Only host can start", [game.host], group)
        if(game.mode === "multi" && game.players.length < 2) return message.reply("❌ Need 2 players first")
        const result = startGame(chat, sender)
        if(result !== "started") return message.reply("⚠️ Could not start")
        if(group) await send(client, message, `✊ *Started!*\n@${getName(game.players[0])} vs @${getName(game.players[1])}\n\nBoth send: *rock* / *paper* / *scissors*`, game.players, group)
        else await message.reply(`✊ *Started!*\nSend: *rock* / *paper* / *scissors*`)
        return
    }

    if(!game.started) return
    if(game.mode === "multi" && !game.players.includes(sender)) return

    const options = ["rock","paper","scissors"]
    if(!options.includes(input)) return message.reply("❌ Send *rock*, *paper* or *scissors*")

    if(game.mode === "single"){
        if(group && sender !== game.host) return
        const bot = options[Math.floor(Math.random()*3)]
        let result
        if(input === bot) result = "🤝 Draw!"
        else if((input==="rock"&&bot==="scissors")||(input==="paper"&&bot==="rock")||(input==="scissors"&&bot==="paper"))
            result = group ? `🎉 @${getName(sender)} wins!` : "🎉 You win!"
        else result = "🤖 Bot wins!"
        await send(client, message, `${result}\nYou: ${input} | Bot: ${bot}\n\nType *.rps* again`, [sender], group)
        endGame(chat); return
    }

    if(!game.data) game.data = {}
    if(game.data[sender]) return send(client, message, `⏳ @${getName(sender)} already locked in`, [sender], group)
    game.data[sender] = input
    await send(client, message, `✅ @${getName(sender)} locked 🔒`, [sender], group)
    if(Object.keys(game.data).length < 2) return

    const players = Object.keys(game.data)
    const p1 = game.data[players[0]], p2 = game.data[players[1]]
    let outcome = "🤝 Draw!"
    if((p1==="rock"&&p2==="scissors")||(p1==="paper"&&p2==="rock")||(p1==="scissors"&&p2==="paper")) outcome = `🏆 @${getName(players[0])} wins!`
    else if(p1!==p2) outcome = `🏆 @${getName(players[1])} wins!`

    await send(client, message, `✊ *Result*\n@${getName(players[0])}: ${p1}\n@${getName(players[1])}: ${p2}\n\n${outcome}\n\nType *.rps* again`, players, group)
    endGame(chat)
}
