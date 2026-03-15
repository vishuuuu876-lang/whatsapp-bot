module.exports = async (client, message, args) => {
    const city = args.join(" ")

    if(!city) return message.reply("Usage: .weather city")

    const fetch = require("node-fetch")

    const res = await fetch(`https://wttr.in/${city}?format=3`)
    const data = await res.text()

    message.reply(`🌤 Weather:\n${data}`)
}
