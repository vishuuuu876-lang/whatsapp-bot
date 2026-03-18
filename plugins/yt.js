import ytSearch from "yt-search"

export default async function(client, message, args){

    if(args.length === 0)
        return message.reply("📺 Usage: .yt song or video name\nExample: .yt interstellar soundtrack")

    const query = args.join(" ")

    try{

        const result = await ytSearch(query)

        if(!result.videos.length)
            return message.reply("❌ No results found")

        const video = result.videos[0]

        // fix: format large view counts to be readable e.g. 45,321,000
        const formattedViews = video.views.toLocaleString()

        await message.reply(
`📺 YouTube Result

Title: ${video.title}
Duration: ${video.timestamp}
Views: ${formattedViews}

🔗 ${video.url}`
        )

    }catch(err){

        console.error("YT search error:", err.message)
        message.reply("❌ Failed to search YouTube, try again")
    }

}
