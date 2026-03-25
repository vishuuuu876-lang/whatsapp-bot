import pkg from "whatsapp-web.js"
const { Client, LocalAuth } = pkg

import {
    games,
    joinGame,
    leaveGame,
    startGame,
    endGame,
    getPlayers,
    gameStatus
} from "./games/engine.js"

import { infoSessions }     from "./plugins/info.js"
import { businessSessions } from "./plugins/business.js"
import { registerUser, getUserSummary } from "./users.js"
import { pendingMode as rpsPending }      from "./plugins/rps.js"
import { pendingMode as scramblePending } from "./plugins/scramble.js"
import { pendingMode as quizPending }     from "./plugins/quiz.js"

// ── CHANGE 1: sudo import ─────────────────────────────────────
import { isSudo, isOwner } from "./sudo.js"

console.log("🚀 Starting WhatsApp bot...")

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message)
    console.error(err.stack)
})

process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason)
})

let reconnectAttempts = 0
const MAX_RECONNECT   = 5
let isReady           = false

function isGroup(message)  { return message.from.endsWith("@g.us") }
function getSender(message){ return message.author || message.from }

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "main-session" }),
    restartOnAuthFail: true,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 10000,
    puppeteer: {
        headless: true,
        executablePath: "/usr/bin/chromium",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
            "--disable-extensions",
            "--disable-background-networking",
            "--disable-default-apps",
            "--disable-sync",
            "--disable-translate",
            "--hide-scrollbars",
            "--metrics-recording-only",
            "--mute-audio",
            "--no-first-run",
            "--safebrowsing-disable-auto-update"
        ]
    }
})

client.on("qr", (qr) => {
    console.log("📱 Scan QR Code:")
    console.log("https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" + encodeURIComponent(qr))
})

client.on("ready", () => {
    isReady = true
    reconnectAttempts = 0
    console.log("✅ WhatsApp Bot Connected and ready")
    console.log(`📅 ${new Date().toISOString()}`)
})

client.on("authenticated", () => { console.log("🔐 Authenticated successfully") })

client.on("auth_failure", (msg) => {
    isReady = false
    console.error("❌ Auth failure:", msg)
})

client.on("disconnected", (reason) => {
    isReady = false
    console.warn("⚠️ Disconnected:", reason)
    if(reconnectAttempts >= MAX_RECONNECT){ console.error("❌ Max reconnects reached."); return }
    const delay = 5000 * Math.pow(2, reconnectAttempts)
    reconnectAttempts++
    console.log(`🔄 Reconnect ${reconnectAttempts}/${MAX_RECONNECT} in ${delay/1000}s...`)
    setTimeout(() => client.initialize().catch(err => console.error("❌ Reinit failed:", err.message)), delay)
})

client.on("message", async (message) => {

    if(!isReady || message.fromMe || !message.body) return

    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)
    const body   = message.body.trim()
    const isCmd  = body.startsWith(".")

    console.log(`📨 [${new Date().toTimeString().slice(0,8)}] [${group?"GROUP":"DM"}] → ${body.slice(0,60)}`)

    registerUser(message)

    /* GAME PENDING MODES — must come before info/business */
    if(!isCmd){
        if(rpsPending[chat]){
            try{ const p = await import("./plugins/rps.js"); await p.default(client, message, []) }
            catch(err){ console.error("❌ RPS pending:", err.message) }
            return
        }
        if(scramblePending[chat]){
            try{ const p = await import("./plugins/scramble.js"); await p.default(client, message, []) }
            catch(err){ console.error("❌ Scramble pending:", err.message) }
            return
        }
        if(quizPending[chat]){
            try{ const p = await import("./plugins/quiz.js"); await p.default(client, message, []) }
            catch(err){ console.error("❌ Quiz pending:", err.message) }
            return
        }
    }

    /* INFO SESSION */
    if(infoSessions[chat] && !isCmd){
        try{ const p = await import("./plugins/info.js"); await p.default(client, message, []) }
        catch(err){ console.error("❌ Info session:", err.message) }
        return
    }

    /* BUSINESS SESSION */
    if(businessSessions[chat] && !isCmd){
        try{ const p = await import("./plugins/business.js"); await p.default(client, message, []) }
        catch(err){ console.error("❌ Business session:", err.message) }
        return
    }

    /* FORCE END */
    if(body.toLowerCase() === ".end"){
        const wasRunning = endGame(chat)
        return message.reply(wasRunning ? "🛑 Game ended\n\nType *.menu* to see commands" : "❌ No active game")
    }

    /* ACTIVE GAME */
    const game = games[chat]
    if(game){
        try{
            const plugin = await import(`./plugins/${game.type}.js`)
            await plugin.default(client, message, message.body.trim().split(/ +/))
        }catch(err){
            console.error(`❌ Game error [${game.type}]:`, err.message)
            try{ await message.reply("⚠️ Game error. Type *.end* to exit.") }catch{}
        }
        return
    }

    if(!isCmd) return

    const args    = body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    console.log(`⚙️ .${command} | ${args.join(", ")||"none"} | ${group?"GROUP":"DM"}`)

    if(command === "ping")   return message.reply("🏓 Pong! Bot is online.")
    if(command === "users")  return message.reply(getUserSummary())

    if(command === "join"){
        const result = joinGame(chat, sender)
        if(result === "no-game")         return message.reply("❌ No game running")
        if(result === "already-joined")  return message.reply("⚠️ Already joined")
        if(result === "already-started") return message.reply("❌ Already started")
        if(result === "player-limit")    return message.reply("❌ Game is full")
        return message.reply("✅ Joined!")
    }

    if(command === "leave"){
        const result = leaveGame(chat, sender)
        if(result === "no-game") return message.reply("❌ No game running")
        return message.reply("👋 Left the game")
    }

    if(command === "start"){
        const result = startGame(chat, sender)
        if(result === "no-game")         return message.reply("❌ No game running")
        if(result === "not-host")        return message.reply("❌ Only host can start")
        if(result === "already-started") return message.reply("⚠️ Already started")
        return message.reply("🎮 Game started!")
    }

    if(command === "players"){
        const players = getPlayers(chat)
        if(!players.length) return message.reply("❌ No active game")
        return message.reply(`👥 Players:\n\n${players.join("\n")}`)
    }

    if(command === "status"){
        const gd = gameStatus(chat)
        if(!gd) return message.reply("❌ No game running")
        return message.reply(`🎮 ${gd.type} | 👥 ${gd.players.length} | ▶ ${gd.started}`)
    }

    // ── CHANGE 2: updated aliases ─────────────────────────────
    // ── CHANGE 2: updated aliases ─────────────────────────────
const aliases = {
    truth: "truthordare",
    dare: "truthordare",
    tod: "truthordare",
    removesudo: "addsudo",   // handled inside addsudo.js
    demote: "promote",       // handled inside promote.js
    unmute: "mute"           // handled inside mute.js
}

const resolved = aliases[command] || command

// ── OWNER ONLY COMMANDS ───────────────────────────────────
const OWNER_ONLY_COMMANDS = ["addsudo", "removesudo"]

if (OWNER_ONLY_COMMANDS.includes(resolved) && !isOwner(sender)) {
    return message.reply("🚫 Only the *bot owner* can use this command.")
}

    // ── CHANGE 3: sudo guard ──────────────────────────────────
    const SUDO_ONLY_COMMANDS = [
        "tagall", "botleave", "botjoin", "forward",
        "promote", "demote", "kick", "mute", "unmute",
        "announce"
    ]

    if(SUDO_ONLY_COMMANDS.includes(resolved) && !isSudo(sender)){
        return message.reply(
            "🚫 You don't have permission to use this command.\n\n" +
            "_Sudo-only: .tagall .botleave .botjoin .forward .promote .kick .mute .unmute .announce_"
        )
    }

    try{
        const plugin = await import(`./plugins/${resolved}.js`)
        if(typeof plugin.default !== "function") return message.reply("⚠️ Command error")
        await plugin.default(client, message, args)
    }catch(err){
        if(err.code === "ERR_MODULE_NOT_FOUND") return message.reply("❌ Command not found\nType *.menu* to see all commands")
        console.error(`❌ Plugin error [${resolved}]:`, err.message)
        try{ await message.reply("⚠️ Something went wrong. Try again.") }catch{}
    }

})

client.initialize().catch(err => {
    console.error("❌ Failed to initialize:", err.message)
})
