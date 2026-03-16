import ytSearch from "yt-search"

export default async function(client,message,args){

if(args.length === 0)
return message.reply("Example:\n.yt interstellar soundtrack")

const query = args.join(" ")

const result = await ytSearch(query)

if(!result.videos.length)
return message.reply("No results")

const video = result.videos[0]

message.reply(
`📺 *YouTube Result*

Title: ${video.title}

Duration: ${video.timestamp}

Views: ${video.views}

Link:
${video.url}`
)

}
