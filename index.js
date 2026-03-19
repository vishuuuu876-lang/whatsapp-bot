import pkg from "whatsapp-web.js"
const { Client, LocalAuth } = pkg
import { mkdirSync } from "fs"

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
import { registerUser }     from "./userstore.js"

/* ensure data directory exists on startup */
try { mkdirSync("./data", { recursive: true }) } catch{}

console.log("🚀 Starting WhatsApp bot...")

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GLOBAL ERROR HANDLERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message)
    console.error(err.stack)
})

process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason)
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RECONNECT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let reconnectAttempts = 0
const MAX_RECONNECT   = 5
let isReady           = false

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function isGroup(message)   { return message.from.endsWith("@g.us") }
function getSender(message) { return message.author || message.from }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CLIENT SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONNECTION EVENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.on("qr", (qr) => {
    console.log("📱 Scan QR Code:")
    console.log(
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
        encodeURIComponent(qr)
    )
})

client.on("ready", () => {
    isReady = true
    reconnectAttempts = 0
    console.log("✅ WhatsApp Bot Connected and ready")
    console.log(`📅 ${new Date().toISOString()}`)
})

client.on("authenticated", () => {
    console.log("🔐 Authenticated successfully")
})

client.on("auth_failure", (msg) => {
    isReady = false
    console.error("❌ Auth failure:", msg)
})

client.on("disconnected", (reason) => {
    isReady = false
    console.warn("⚠️ Disconnected. Reason:", reason)

    if(reconnectAttempts >= MAX_RECONNECT){
        console.error("❌ Max reconnects reached. Restart Railway manually.")
        return
    }

    const delay = 5000 * Math.pow(2, reconnectAttempts)
    reconnectAttempts++
    console.log(`🔄 Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT} in ${delay/1000}s...`)

    setTimeout(() => {
        client.initialize().catch(err => {
            console.error("❌ Reinitialize failed:", err.message)
        })
    }, delay)
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MESSAGE HANDLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.on("message", async (message) => {

    if(!isReady)       return
    if(message.fromMe) return
    if(!message.body)  return

    const chat   = message.from
    const sender = getSender(message)
    const group  = isGroup(message)

    console.log(`📨 [${new Date().toTimeString().slice(0,8)}] [${group ? "GROUP" : "DM"}] → ${message.body.slice(0,60)}`)

    /* ── REGISTER USER ──────────────────────────────
       Save every person who interacts with the bot.
       Runs silently on every message, never blocks.
    ─────────────────────────────────────────────── */
    try { registerUser(sender, chat, group) } catch{}

    /* INFO SESSION */
    if(infoSessions[chat] && !message.body.startsWith(".")){
        try{
            const plugin = await import("./plugins/info.js")
            await plugin.default(client, message, [])
        }catch(err){
            console.error("❌ Info session error:", err.message)
        }
        return
    }

    /* BUSINESS SESSION */
    if(businessSessions[chat] && !message.body.startsWith(".")){
        try{
            const plugin = await import("./plugins/business.js")
            await plugin.default(client, message, [])
        }catch(err){
            console.error("❌ Business session error:", err.message)
        }
        return
    }

    /* FORCE END — works inside any active game */
    if(message.body.toLowerCase().trim() === ".end"){
        const wasRunning = endGame(chat)
        if(wasRunning) return message.reply("🛑 Game ended\n\nType *.menu* to see all commands")
        return message.reply("❌ No active game to end")
    }

    /* ACTIVE GAME INPUT */
    const game = games[chat]

    if(game){
        try{
            const plugin = await import(`./plugins/${game.type}.js`)
            const args   = message.body.trim().split(/ +/)
            await plugin.default(client, message, args)
        }catch(err){
            console.error(`❌ Game plugin error [${game.type}]:`, err.message)
            console.error(err.stack)
            try{ await message.reply("⚠️ Game error. Type *.end* to exit and try again.") }catch{}
        }
        return
    }

    /* COMMANDS ONLY */
    if(!message.body.startsWith(".")) return

    const args    = message.body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    console.log(`⚙️ Command: .${command} | Args: ${args.join(", ") || "none"} | ${group ? "GROUP" : "DM"}`)

    /* BUILT-IN COMMANDS */
    if(command === "ping"){
        return message.reply("🏓 Pong! Bot is online.")
    }

    if(command === "join"){
        const result = joinGame(chat, sender)
        if(result === "no-game")         return message.reply("❌ No game running")
        if(result === "already-joined")  return message.reply("⚠️ You already joined")
        if(result === "already-started") return message.reply("❌ Game already started")
        if(result === "player-limit")    return message.reply("❌ Game is full")
        return message.reply("✅ Joined the game")
    }

    if(command === "leave"){
        const result = leaveGame(chat, sender)
        if(result === "no-game") return message.reply("❌ No game running")
        return message.reply("👋 You left the game")
    }

    if(command === "start"){
        const result = startGame(chat, sender)
        if(result === "no-game")         return message.reply("❌ No game running")
        if(result === "not-host")        return message.reply("❌ Only the host can start")
        if(result === "already-started") return message.reply("⚠️ Game already started")
        return message.reply("🎮 Game started")
    }

    if(command === "players"){
        const players = getPlayers(chat)
        if(players.length === 0) return message.reply("❌ No active game")
        return message.reply(`👥 Players:\n\n${players.join("\n")}`)
    }

    if(command === "status"){
        const gameData = gameStatus(chat)
        if(!gameData) return message.reply("❌ No game running")
        return message.reply(
            `🎮 Game: ${gameData.type}\n👥 Players: ${gameData.players.length}\n▶ Started: ${gameData.started}`
        )
    }

    /* COMMAND ALIASES */
    const aliases = {
        truth: "truthordare",
        dare:  "truthordare",
        tod:   "truthordare"
    }

    const resolvedCommand = aliases[command] || command

    /* PLUGIN LOADER */
    try{
        const plugin = await import(`./plugins/${resolvedCommand}.js`)

        if(typeof plugin.default !== "function"){
            console.error(`❌ Plugin [${resolvedCommand}] missing default export`)
            return message.reply("⚠️ Command error")
        }

        await plugin.default(client, message, args)

    }catch(err){

        if(err.code === "ERR_MODULE_NOT_FOUND"){
            return message.reply("❌ Command not found\nType *.menu* to see all commands")
        }

        console.error(`❌ Plugin error [${resolvedCommand}]:`, err.message)
        console.error(err.stack)
        try{ await message.reply("⚠️ Something went wrong. Try again.") }catch{}
    }

})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.initialize().catch(err => {
    console.error("❌ Failed to initialize:", err.message)
    console.error(err.stack)
})
