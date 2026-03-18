import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import {
    games,
    joinGame,
    leaveGame,
    startGame,
    endGame,
    getPlayers,
    gameStatus
} from "./games/engine.js";

console.log("🚀 Starting WhatsApp bot...");

/* CREATE CLIENT */
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "main-session" }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    }
});

/* QR */
client.on("qr", (qr) => {
    console.log("Scan this QR Code:");
    console.log(
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
        encodeURIComponent(qr)
    );
});

/* READY */
client.on("ready", () => {
    console.log("✅ WhatsApp Bot Connected and Ready!");
});

/* MESSAGE HANDLER */
client.on("message", async (message) => {

    if (message.fromMe) return;
    if (!message.body) return;

    const chat = message.from;
    const sender = message.author || message.from;
    const body = message.body.trim();
    const input = body.toLowerCase();

    console.log(`[MSG] ${sender} → ${body}`);

    /* GAME INPUT */
    const game = games[chat];

    if (game && !input.startsWith(".")) {
        try {
            const plugin = await import(`./plugins/${game.type}.js`);
            await plugin.default(client, message, []);
            return;
        } catch (err) {
            console.error("Game processing error:", err);
            return message.reply("⚠️ Game error occurred.");
        }
    }

    /* ONLY COMMANDS */
    if (!body.startsWith(".")) return;

    const args = body.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    /* SYSTEM COMMANDS */

    if (command === "join") {
        const res = joinGame(chat, sender);
        if (res === "joined") return message.reply("✅ You joined the game.");
        if (res === "already-joined") return message.reply("⚠️ Already in game.");
        return message.reply("❌ No game found.");
    }

    if (command === "leave") {
        const res = leaveGame(chat, sender);
        return message.reply(
            res === "game-ended"
                ? "🛑 Game ended (host left)"
                : "👋 You left the game"
        );
    }

    if (command === "start") {
        const res = startGame(chat, sender);
        if (res === "started") return message.reply("🎮 Game started!");
        if (res === "not-host") return message.reply("❌ Only host can start.");
        return message.reply("❌ Start failed.");
    }

    if (command === "end" || command === "exit") {
        endGame(chat);
        return message.reply("🛑 Game ended.");
    }

    if (command === "restart") {
        const game = games[chat];
        if (!game) return message.reply("❌ No game to restart.");

        game.data = {};
        game.started = true;

        return message.reply("🔄 Game restarted!");
    }

    if (command === "players") {
        const players = getPlayers(chat);
        if (players.length === 0)
            return message.reply("No players.");

        const list = players
            .map(p => `@${p.split("@")[0]}`)
            .join("\n");

        return message.reply(
            `👥 Players:\n${list}`,
            null,
            { mentions: players }
        );
    }

    if (command === "status") {
        const gameData = gameStatus(chat);

        if (!gameData)
            return message.reply("No game running.");

        return message.reply(
            `🎮 Game: ${gameData.type}
👥 Players: ${gameData.players.length}
▶ Started: ${gameData.started}`
        );
    }

    /* PLUGIN SYSTEM */
    try {
        const plugin = await import(`./plugins/${command}.js`);
        await plugin.default(client, message, args);
    } catch (err) {

        if (err.code === "ERR_MODULE_NOT_FOUND") {
            return message.reply("❌ Unknown command");
        }

        console.error("Plugin Error:", err);
        message.reply("⚠️ Command error");
    }

});

/* START */
client.initialize();
