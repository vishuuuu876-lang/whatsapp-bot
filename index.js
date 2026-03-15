import pkg from "whatsapp-web.js"
const { Client, LocalAuth } = pkg

console.log("Starting WhatsApp bot...")

const client = new Client({
    authStrategy: new LocalAuth(),
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

    const qrLink = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" + encodeURIComponent(qr)

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

    if (!message.body.startsWith(".")) return

    const args = message.body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    try {

        const plugin = await import(`./plugins/${command}.js`)
        plugin.default(client, message, args)

    } catch (err) {

        message.reply("❌ Command not found")

    }

})

client.initialize()
