client.on("message", async (message) => {

if(message.fromMe) return
if(!message.body) return

const chat = message.from
const sender = message.author || message.from

/* GAME INPUT FIRST */
const game = games[chat]

if(game){
try{
const plugin = await import(`./plugins/${game.type}.js`)
await plugin.default(client, message, [])
}catch(err){
console.error("Game input error:", err)
}
return
}

/* ONLY COMMANDS */
if(!message.body.startsWith(".")) return

const args = message.body.slice(1).trim().split(/ +/)
const command = args.shift().toLowerCase()

/* ENGINE COMMANDS */

if(command === "join"){
joinGame(chat, sender)
return message.reply("✅ Joined the game")
}

if(command === "leave"){
leaveGame(chat, sender)
return message.reply("👋 You left the game")
}

if(command === "start"){
startGame(chat, sender)
return message.reply("🎮 Game started")
}

if(command === "end"){
endGame(chat, sender)
return message.reply("🛑 Game ended")
}

if(command === "players"){
const players = getPlayers(chat)

if(players.length === 0)
return message.reply("No players")

return message.reply(`👥 Players:\n\n${players.join("\n")}`)
}

if(command === "status"){
const gameData = gameStatus(chat)

if(!gameData)
return message.reply("No game running")

return message.reply(
`🎮 Game: ${gameData.type}
👥 Players: ${gameData.players.length}
▶ Started: ${gameData.started}`
)
}

/* PLUGIN SYSTEM */
try{
const plugin = await import(`./plugins/${command}.js`)
await plugin.default(client, message, args)
}catch(err){

if(err.code === "ERR_MODULE_NOT_FOUND"){
return message.reply("❌ Command not found")
}

console.error(err)
message.reply("⚠️ Command error")
}

})
client.initialize()
