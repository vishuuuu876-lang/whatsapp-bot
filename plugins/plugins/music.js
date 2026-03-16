import ytSearch from "yt-search"
import ytdl from "ytdl-core"

export default async function(client,message,args){

if(args.length === 0)
return message.reply("Example:\n.music alan walker faded")

const query = args.join(" ")

const result = await ytSearch(query)

if(!result.videos.length)
return message.reply("Song not found")

const video = result.videos[0]

message.reply("🎵 Downloading music...")

const stream = ytdl(video.url,{filter:"audioonly"})

await client.sendMessage(message.from,{
audio: stream,
mimetype: "audio/mp4"
})

}
