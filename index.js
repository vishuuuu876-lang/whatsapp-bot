import pkg from "whatsapp-web.js"
const { Client, LocalAuth } = pkg

console.log("Starting WhatsApp bot...")

const client = new Client({
authStrategy: new LocalAuth(),
puppeteer:{
headless:true,
args:[
'--no-sandbox',
'--disable-setuid-sandbox',
'--disable-dev-shm-usage'
]
}
})

client.on("qr",(qr)=>{

const qrLink = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" + encodeURIComponent(qr)

console.log("")
console.log("SCAN THIS QR LINK:")
console.log(qrLink)
console.log("")

})

client.on("ready",()=>{
console.log("✅ WhatsApp Bot Connected")
})

client.on("message", async (message)=>{

const text = message.body.toLowerCase()

if(text === ".ping"){
message.reply("🏓 Pong!")
}

if(text === ".menu"){
message.reply(`
🤖 Bot Commands

.ping
.menu
`)
}

})

client.initialize()
