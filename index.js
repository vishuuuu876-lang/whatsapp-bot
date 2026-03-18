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

console.log("Starting WhatsApp bot...")

/* GLOBAL ERROR HANDLERS — prevents Railway crashes on unhandled errors */
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err)
})

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason)
})

/* CREATE CLIENT */
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "main-session"
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    }
})

/* QR */
client.on("qr", (qr) => {
    console.log("Scan QR:")
    console.log(
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
        encodeURIComponent(qr)
    )
})

/* READY */
client.on("ready", () => {
    console.log("✅ WhatsApp Bot Connected")
})

/* DISCONNECTED — reconnect automatically */
client.on("disconnected", (reason) => {
    console.log("Bot disconnected:", reason)
    console.log("Reinitializing...")
    client.initialize()
})

/* MESSAGE HANDLER */
client.on("message", async (message) => {

    if (message.fromMe) return
    if (!message.body) return

    const chat = message.from
    const sender = message.author || message.from

    /* INFO SESSION — intercept numbered replies before anything else */
    if (infoSessions[chat] && !message.body.startsWith(".")) {
        try {
            const infoPlugin = await import("./plugins/info.js")
            await infoPlugin.default(client, message, [])
        } catch (err) {
            console.error("Info session error:", err)
        }
        return
    }

    /* GAME INPUT */
    const game = games[chat]

    if (game) {
        try {
            const plugin = await import(`./plugins/${game.type}.js`)
            const args = message.body.trim().split(/ +/)
            await plugin.default(client, message, args)
        } catch (err) {
            console.error("Game input error:", err)
        }
        return
    }

    /* COMMANDS ONLY */
    if (!message.body.startsWith(".")) return

    const args = message.body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    if (command === "join") {
        const result = joinGame(chat, sender)
        if (result === "no-game") return message.reply("❌ No game running")
        if (result === "already-joined") return message.reply("⚠️ You already joined")
        if (result === "already-started") return message.reply("❌ Game already started")
        if (result === "player-limit") return message.reply("❌ Game is full")
        return message.reply("✅ Joined the game")
    }

    if (command === "leave") {
        const result = leaveGame(chat, sender)
        if (result === "no-game") return message.reply("❌ No game running")
        return message.reply("👋 You left the game")
    }

    if (command === "start") {
        const result = startGame(chat, sender)
        if (result === "no-game") return message.reply("❌ No game running")
        if (result === "not-host") return message.reply("❌ Only the host can start")
        if (result === "already-started") return message.reply("⚠️ Game already started")
        return message.reply("🎮 Game started")
    }

    if (command === "end") {
        const game = gameStatus(chat)
        if (!game) return message.reply("❌ No game running")
        if (game.host !== sender) return message.reply("❌ Only the host can end the game")
        endGame(chat)
        return message.reply("🛑 Game ended")
    }

    if (command === "players") {
        const players = getPlayers(chat)
        if (players.length === 0) return message.reply("No players in any active game")
        return message.reply(`👥 Players:\n\n${players.join("\n")}`)
    }

    if (command === "status") {
        const gameData = gameStatus(chat)
        if (!gameData) return message.reply("No game running")
        return message.reply(
            `🎮 Game: ${gameData.type}\n👥 Players: ${gameData.players.length}\n▶ Started: ${gameData.started}`
        )
    }

    /* COMMAND ALIASES */
    const aliases = {
        truth: "truthordare",
        dare: "truthordare",
        tod: "truthordare"
    }

    const resolvedCommand = aliases[command] || command

    /* PLUGINS */
    try {
        const plugin = await import(`./plugins/${resolvedCommand}.js`)
        await plugin.default(client, message, args)
    } catch (err) {
        if (err.code === "ERR_MODULE_NOT_FOUND") {
            return message.reply("❌ Command not found")
        }
        console.error(err)
        message.reply("⚠️ Command error")
    }

})

/* START BOT */
client.initialize()
