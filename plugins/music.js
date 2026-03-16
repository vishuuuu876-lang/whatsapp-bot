import yts from "yt-search"
import ytdl from "ytdl-core"

export default async function(client, message, args){

if(args.length === 0)
return message.reply(
"🎵 Usage: .music song name\nExample: .music believer"
)

const query = args.join(" ")

try{

const search = await yts(query)

if(!search.videos.length)
return message.reply("❌ Song not found")

const video = search.videos[0]

await message.reply(`🎵 Downloading: ${video.title}`)

const stream = ytdl(video.url, {
filter: "audioonly",
quality: "highestaudio"
})

await client.sendMessage(message.from, {
audio: stream,
mimetype: "audio/mp4"
})

}catch(err){

console.error(err)
message.reply("❌ Failed to fetch music")

}

}
