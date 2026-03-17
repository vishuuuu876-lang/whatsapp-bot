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

console.log("Starting WhatsApp bot...")

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

/* QR CODE GENERATOR */

client.on("qr", (qr) => {

const qrLink =
"https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
encodeURIComponent(qr)

console.log("")
console.log("SCAN THIS QR LINK:")
console.log(qrLink)
console.log("")

})

/* BOT READY */

client.on("ready", () => {
console.log("✅ WhatsApp Bot Connected")
})

/* MESSAGE HANDLER */

client.on("message", async (message) => {

if(message.fromMe) return
if(!message.body) return

// GAME INPUT (if a game is running)

const chat = message.from
const game = games[chat]

if(game){

try{

const plugin = await import(`./plugins/${game.type}.js`)
await plugin.default(client,message,[])

}catch(err){
console.error("Game input error:",err)
}

return
}
  
/* COMMAND PARSER */

const args = message.body.slice(1).trim().split(/ +/)
const command = args.shift().toLowerCase()

const chat = message.from
const sender = message.author || message.from

/* GAME ENGINE COMMANDS */

if(command === "join"){
joinGame(chat,sender)
return message.reply("✅ Joined the game")
}

if(command === "leave"){
leaveGame(chat,sender)
return message.reply("👋 You left the game")
}

if(command === "start"){
startGame(chat,sender)
return message.reply("🎮 Game started")
}

if(command === "end"){
endGame(chat,sender)
return message.reply("🛑 Game ended")
}

if(command === "players"){
const players = getPlayers(chat)

if(players.length === 0)
return message.reply("No players")

return message.reply(`👥 Players:\n\n${players.join("\n")}`)
}

if(command === "status"){

const game = gameStatus(chat)

if(!game)
return message.reply("No game running")

return message.reply(
`🎮 Game: ${game.type}

👥 Players: ${game.players.length}

▶ Started: ${game.started}`
)
}

/* PLUGIN SYSTEM */

try {

const plugin = await import(`./plugins/${command}.js`)
await plugin.default(client,message,args)

} catch (err) {

if(err.code === "ERR_MODULE_NOT_FOUND"){
return message.reply("❌ Command not found")
}

console.error(err)
message.reply("⚠️ Command error")

}

})

client.initialize()
