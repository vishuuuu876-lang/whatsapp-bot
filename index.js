import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import qrcode from "qrcode-terminal"

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("auth")

const sock = makeWASocket({
auth: state,
logger: pino({ level: "silent" }),
browser: ["Ubuntu","Chrome","20.0.04"]
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", ({ connection, qr }) => {

if(qr){
console.log("SCAN THIS QR:")
console.log("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + qr)
}

if(connection === "open"){
console.log("✅ WhatsApp Bot Connected")
}

})

sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]

if(!msg.message || msg.key.fromMe) return

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text

if(text === ".ping"){
await sock.sendMessage(msg.key.remoteJid,{text:"🏓 Pong!"})
}

})

}

console.log("Starting WhatsApp bot...")
startBot()
