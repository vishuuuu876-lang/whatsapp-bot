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

sock.ev.on("connection.update", ({connection, qr}) => {

if(qr){
console.log("Scan QR with WhatsApp")
qrcode.generate(qr,{small:true})
}

if(connection === "open"){
console.log("Bot Connected")
}

})

sock.ev.on("messages.upsert", async ({messages}) => {

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

startBot()
