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

import { infoSessions } from "./plugins/info.js"

console.log("🚀 Starting WhatsApp bot...")

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GLOBAL ERROR HANDLERS
   Prevents Railway from silently dying
   on any unhandled error or rejection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message)
    console.error(err.stack)
    // do NOT call process.exit — keep the bot alive
})

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise)
    console.error("Reason:", reason)
    // do NOT call process.exit — keep the bot alive
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RECONNECT STATE
   Tracks reconnect attempts to prevent
   infinite reconnect loops on Railway
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
let isReady = false

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CLIENT SETUP
   - executablePath: uses system Chromium
     installed in Dockerfile, not Puppeteer's
     bundled one which doesn't exist on Railway
   - Memory args: prevent Railway OOM kill
   - takeoverOnConflict: kills the other
     session if two are linked (your issue)
   - restartOnAuthFail: auto recovers from
     WhatsApp kicking the session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "main-session"
    }),
    puppeteer: {
        headless: true,
        executablePath: "/usr/bin/chromium",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",   // use disk instead of /dev/shm (Railway has tiny /dev/shm)
            "--disable-gpu",              // no GPU on Railway
            "--single-process",           // one process instead of multiple = less memory
            "--no-zygote",                // disables zygote process = less memory
            "--disable-extensions",       // no extensions needed
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
    },
    restartOnAuthFail: true,      // auto restart if WhatsApp kicks auth
    takeoverOnConflict: true,     // kill competing sessions (fixes your two-session issue)
    takeoverTimeoutMs: 10000      // wait 10s before taking over conflicting session
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   QR CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.on("qr", (qr) => {
    console.log("📱 Scan QR Code:")
    console.log(
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
        encodeURIComponent(qr)
    )
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.on("ready", () => {
    isReady = true
    reconnectAttempts = 0 // reset counter on successful connect
    console.log("✅ WhatsApp Bot Connected and ready")
    console.log(`📅 ${new Date().toISOString()}`)
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUTH FAILURE
   Logs clearly instead of dying silently
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.on("auth_failure", (msg) => {
    isReady = false
    console.error("❌ Auth failure:", msg)
    console.log("🔄 Will attempt to reinitialize...")
})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISCONNECTED
   Reconnects with backoff to avoid
   hammering WhatsApp servers which
   causes permanent session bans
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.on("disconnected", (reason) => {
    isReady = false
    console.log("⚠️ Bot disconnected. Reason:", reason)

    if(reconnectAttempts >= MAX_RECONNECT_ATTEMPTS){
        console.error("❌ Max reconnect attempts reached. Please restart the Railway service manually.")
        return
    }

    // exponential backoff: 5s, 10s, 20s, 40s, 80s
    const delay = 5000 * Math.pow(2, reconnectAttempts)
    reconnectAttempts++

    console.log(`🔄 Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay / 1000}s...`)

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

    // drop messages if bot is not in ready state
    if(!isReady) return

    if(message.fromMe) return
    if(!message.body) return

    const chat = message.from
    const sender = message.author || message.from

    // log every incoming message for Railway debugging
    console.log(`📨 [${new Date().toTimeString().slice(0,8)}] ${chat.slice(0,20)} → ${message.body.slice(0,60)}`)

    /* INFO SESSION — intercept number replies before command check */
    if(infoSessions[chat] && !message.body.startsWith(".")){
        try{
            const infoPlugin = await import("./plugins/info.js")
            await infoPlugin.default(client, message, [])
        }catch(err){
            console.error("❌ Info session error:", err.message)
        }
        return
    }

    /* GAME INPUT */
    const game = games[chat]

    if(game){
        try{
            const plugin = await import(`./plugins/${game.type}.js`)
            const args = message.body.trim().split(/ +/)
            await plugin.default(client, message, args)
        }catch(err){
            console.error(`❌ Game plugin error [${game.type}]:`, err.message)
            // notify user something went wrong without crashing
            try{ await message.reply("⚠️ Game error, try again") }catch{}
        }
        return
    }

    /* COMMANDS ONLY */
    if(!message.body.startsWith(".")) return

    const args = message.body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    console.log(`⚙️ Command: .${command} | Args: ${args.join(", ") || "none"}`)

    /* BUILT-IN COMMANDS */
    if(command === "ping"){
        return message.reply("🏓 Pong! Bot is online.")
    }

    if(command === "join"){
        const result = joinGame(chat, sender)
        if(result === "no-game") return message.reply("❌ No game running")
        if(result === "already-joined") return message.reply("⚠️ You already joined")
        if(result === "already-started") return message.reply("❌ Game already started")
        if(result === "player-limit") return message.reply("❌ Game is full")
        return message.reply("✅ Joined the game")
    }

    if(command === "leave"){
        const result = leaveGame(chat, sender)
        if(result === "no-game") return message.reply("❌ No game running")
        return message.reply("👋 You left the game")
    }

    if(command === "start"){
        const result = startGame(chat, sender)
        if(result === "no-game") return message.reply("❌ No game running")
        if(result === "not-host") return message.reply("❌ Only the host can start")
        if(result === "already-started") return message.reply("⚠️ Game already started")
        return message.reply("🎮 Game started")
    }

    if(command === "end"){
        const gameData = gameStatus(chat)
        if(!gameData) return message.reply("❌ No game running")
        if(gameData.host !== sender) return message.reply("❌ Only the host can end the game")
        endGame(chat)
        return message.reply("🛑 Game ended")
    }

    if(command === "players"){
        const players = getPlayers(chat)
        if(players.length === 0) return message.reply("No players in any active game")
        return message.reply(`👥 Players:\n\n${players.join("\n")}`)
    }

    if(command === "status"){
        const gameData = gameStatus(chat)
        if(!gameData) return message.reply("No game running")
        return message.reply(
            `🎮 Game: ${gameData.type}\n👥 Players: ${gameData.players.length}\n▶ Started: ${gameData.started}`
        )
    }

    /* COMMAND ALIASES */
    const aliases = {
        truth:   "truthordare",
        dare:    "truthordare",
        tod:     "truthordare"
    }

    const resolvedCommand = aliases[command] || command

    /* PLUGIN LOADER */
    try{
        const plugin = await import(`./plugins/${resolvedCommand}.js`)

        // guard: make sure plugin has a valid default export
        if(typeof plugin.default !== "function"){
            console.error(`❌ Plugin [${resolvedCommand}] has no default export function`)
            return message.reply("⚠️ Command error")
        }

        await plugin.default(client, message, args)

    }catch(err){

        if(err.code === "ERR_MODULE_NOT_FOUND"){
            return message.reply("❌ Command not found")
        }

        // log which plugin crashed and full error for Railway debugging
        console.error(`❌ Plugin error [${resolvedCommand}]:`, err.message)
        console.error(err.stack)

        // always reply so user knows something happened
        try{ await message.reply("⚠️ Command error, try again") }catch{}
    }

})

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INITIALIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
client.initialize().catch(err => {
    console.error("❌ Failed to initialize client:", err.message)
    console.error(err.stack)
})
