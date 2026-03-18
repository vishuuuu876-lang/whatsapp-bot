export default async function(client, message, args){

    if(!args.length){
        return message.reply(
            "🔎 Usage: .search topic\nExample: .search WhatsApp"
        )
    }

    const query = args.join(" ")

    try{

        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
            { headers: { "User-Agent": "WhatsAppBot/1.0" } }
        )

        // fix: check HTTP status before parsing — 404 returns a JSON error object
        if(!res.ok){
            if(res.status === 404)
                return message.reply(`❌ No Wikipedia article found for: ${query}\nTry a different search term`)
            return message.reply("⚠️ Error fetching information, try again")
        }

        const data = await res.json()

        // fix: handle disambiguation pages — extract is present but unhelpful
        if(data.type === "disambiguation"){
            return message.reply(
                `📚 "${data.title}" has multiple meanings.\n\nTry being more specific, e.g.:\n.search Mercury planet\n.search Mercury element`
            )
        }

        if(!data.extract)
            return message.reply("❌ No information found")

        // fix: cut summary at last full stop within 700 chars — avoids mid-sentence cutoff
        let summary = data.extract
        if(summary.length > 700){
            const trimmed = summary.slice(0, 700)
            const lastDot = trimmed.lastIndexOf(".")
            summary = lastDot > 400 ? trimmed.slice(0, lastDot + 1) : trimmed + "..."
        }

        // fix: guard against missing content_urls before accessing nested property
        const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`

        await message.reply(
`📚 ${data.title}

${summary}

🔗 ${pageUrl}`
        )

    }catch(err){

        console.error("Search error:", err.message)
        message.reply("⚠️ Error fetching information")
    }

}
