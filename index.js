import pkg from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'

const { Client, LocalAuth } = pkg

const client = new Client({
authStrategy: new LocalAuth(),
puppeteer: {
headless: true,
args: [
'--no-sandbox',
'--disable-setuid-sandbox'
]
}
})

client.on('qr', qr => {
console.log("Scan this QR with WhatsApp:")
qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
console.log("✅ WhatsApp Bot Connected")
})

client.on('message', async message => {

if(message.body === ".ping"){
message.reply("🏓 Pong!")
}

if(message.body === ".menu"){
message.reply(
`🤖 Bot Commands

.ping
.menu
`
)
}

})

client.initialize()
