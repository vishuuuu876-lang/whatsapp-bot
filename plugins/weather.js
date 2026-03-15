export default async function (client, message, args) {

    if (args.length === 0) {
        message.reply("Usage: .weather city\nExample: .weather Kochi")
        return
    }

    const city = args.join(" ")

    try {

        const response = await fetch(`https://wttr.in/${city}?format=%l:+%C+%t+%h+%w`)
        const data = await response.text()

        message.reply(`🌤 Weather Report\n\n${data}`)

    } catch (error) {

        message.reply("❌ Could not fetch weather data")

    }

}
