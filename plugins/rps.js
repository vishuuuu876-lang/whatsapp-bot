import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"
import { isGroup, getSender, getName } from "../helpers.js"

const pendingMode = {}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    /* MODE SELECTION */
    if(!games[chat] && !pendingMode[chat]){

        if(args[0] === "single" || args[0] === "multi" || args[0] === "solo"){
            // mode passed directly — skip menu
        } else {
            pendingMode[chat] = true

            if(group){
                // in group show both options
                return message.reply(
`✊ *Rock Paper Scissors*

Choose a mode:

1️⃣ *Single player* — you vs bot
2️⃣ *Multiplayer* — play with group members

_Reply 1 or 2 — Reply 0 to cancel_`)
            } else {
                // in private chat only single player available
                return message.reply(
`✊ *Rock Paper Scissors*

1️⃣ *Single player* — you vs bot

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

Add the bot to a WhatsApp group to play with friends.

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

        // extra guard — block multi in private chat
        if(mode === "multi" && !group){
            return message.reply(
`⚠️ *Multiplayer only works in group chats!*

Add the bot to a group to play with friends.
Type *.rps* again to play solo.`)
        }

        createGame(chat, "rps", sender, mode)

        if(mode === "multi"){
            return message.reply(
`✊ *RPS — Multiplayer*
Started by @${getName(sender)}

━━━━━━━━━━━━━━
🕹 *Commands:*
*.join* — join the game (need 2 players)
*.start* — start (host only)
*.end* — cancel
_.help* — show commands_
━━━━━━━━━━━━━━`,
            { mentions: [sender] }
            )
        }

        startGame(chat, sender)
        return message.reply(
`✊ *Rock Paper Scissors — vs Bot*

━━━━━━━━━━━━━━
Send your choice:
*rock* / *paper* / *scissors*

🕹 *.help* — commands | *.end* — quit
━━━━━━━━━━━━━━`)
    }

    let game = games[chat]
    if(!game) return

    /* HELP */
    if(input === ".help"){
        if(!game.started){
            return message.reply(
`✊ *RPS Lobby Commands*
*.join* — join the game
*.start* — start (host only, needs 2 players)
*.end* — cancel`)
        }
        return message.reply(
`✊ *RPS Commands*
*rock* / *paper* / *scissors* — make your move
*.end* — quit`)
    }

    /* JOIN */
    if(input === ".join"){
        if(!group) return message.reply("❌ Join is only for group multiplayer games")
        if(game.players.includes(sender))
            return message.reply(`⚠️ @${getName(sender)} you already joined!`, { mentions: [sender] })
        if(game.players.length >= 2)
            return message.reply("❌ Game is full — only 2 players")

        const result = joinGame(chat, sender)
        if(result === "already-started") return message.reply("❌ Game already started")

        const ready = game.players.length === 2
        return message.reply(
`✅ @${getName(sender)} joined! (${game.players.length}/2)

${ready
    ? `Both players ready!\n@${getName(game.host)} send *.start* to begin`
    : "Waiting for one more player..."}`,
        { mentions: ready ? [sender, game.host] : [sender] }
        )
    }

    /* START */
    if(input === ".start"){
        if(sender !== game.host)
            return message.reply(
                group
                    ? `❌ Only @${getName(game.host)} can start`
                    : "❌ Only the host can start",
                group ? { mentions: [game.host] } : {}
            )
        if(game.mode === "multi" && game.players.length < 2)
            return message.reply("❌ Need 2 players — someone send *.join* first")

        const result = startGame(chat, sender)
        if(result !== "started") return message.reply("⚠️ Could not start")

        if(group){
            const p1 = getName(game.players[0])
            const p2 = getName(game.players[1])
            return message.reply(
`✊ *Game Started!*

@${p1} vs @${p2}

Both send: *rock* / *paper* / *scissors*
_.end — quit_`,
            { mentions: game.players }
            )
        }

        return message.reply(`✊ *Game Started!*\n\nSend: *rock* / *paper* / *scissors*`)
    }

    if(!game.started) return

    if(game.mode === "multi" && !game.players.includes(sender)) return

    const options = ["rock", "paper", "scissors"]

    if(!options.includes(input))
        return message.reply("❌ Send *rock*, *paper* or *scissors*\nType *.help* for commands")

    /* SINGLE PLAYER */
    if(game.mode === "single"){
        if(group && sender !== game.host) return
        const bot = options[Math.floor(Math.random() * 3)]
        let result
        if(input === bot){
            result = "🤝 *Draw!*"
        } else if(
            (input === "rock"     && bot === "scissors") ||
            (input === "paper"    && bot === "rock")     ||
            (input === "scissors" && bot === "paper")
        ){
            result = group ? `🎉 @${getName(sender)} wins!` : "🎉 *You win!*"
        } else {
            result = "🤖 *Bot wins!*"
        }
        await message.reply(
            `${result}\nYou: ${input} | Bot: ${bot}\n\nType *.rps* to play again`,
            group ? { mentions: [sender] } : {}
        )
        endGame(chat)
        return
    }

    /* MULTIPLAYER */
    if(!game.data) game.data = {}

    if(game.data[sender])
        return message.reply(`⏳ @${getName(sender)} already locked in — waiting for opponent`, { mentions: [sender] })

    game.data[sender] = input
    await message.reply(`✅ @${getName(sender)} locked in 🔒`, { mentions: [sender] })

    if(Object.keys(game.data).length < 2) return

    const players = Object.keys(game.data)
    const p1      = game.data[players[0]]
    const p2      = game.data[players[1]]

    let outcome = "🤝 *Draw!*"
    if(
        (p1 === "rock"     && p2 === "scissors") ||
        (p1 === "paper"    && p2 === "rock")     ||
        (p1 === "scissors" && p2 === "paper")
    ){
        outcome = `🏆 @${getName(players[0])} wins!`
    } else if(p1 !== p2){
        outcome = `🏆 @${getName(players[1])} wins!`
    }

    await message.reply(
`✊ *RPS Result*

@${getName(players[0])}: ${p1}
@${getName(players[1])}: ${p2}

${outcome}

Type *.rps* to play again`,
    { mentions: players }
    )

    endGame(chat)
}
