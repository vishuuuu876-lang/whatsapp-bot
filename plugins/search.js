export default async function (client, message, args) {

    if (!args.length) {
        message.reply("🔎 Usage: .search topic\nExample: .search WhatsApp")
        return
    }

    const query = args.join(" ")

    try {

        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        )

        const data = await res.json()

        if (data.extract) {

            message.reply(`📚 *${data.title}*\n\n${data.extract}`)

        } else {

            message.reply("❌ No information found")

        }

    } catch (err) {

        message.reply("⚠️ Error fetching information")

    }

}
