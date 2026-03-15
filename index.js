import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"

async function startBot(){

console.log("Starting WhatsApp bot...")

const { state, saveCreds } = await useMultiFileAuthState("auth")

const sock = makeWASocket({
auth: state,
logger: pino({ level: "silent" }),
browser: ["RailwayBot","Chrome","1.0"]
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", (update) => {

const { connection, qr, lastDisconnect } = update

if(qr){
console.log("SCAN QR:")
console.log("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + qr)
}

if(connection === "open"){
console.log("✅ WhatsApp Bot Connected")
}

if(connection === "close"){

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("Connection closed. Reconnecting:", shouldReconnect)

if(shouldReconnect){
startBot()
}

}

})

sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]

if(!msg.message || msg.key.fromMe) return

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text

if(text === ".ping"){
await sock.sendMessage(msg.key.remoteJid,{ text: "🏓 Pong!" })
}

})

}

startBot()
