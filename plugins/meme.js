import axios from "axios"
import { MessageMedia } from "whatsapp-web.js"

export default async function(client, message, args){

try{

const res = await axios.get("https://meme-api.com/gimme")
const meme = res.data

const media = await MessageMedia.fromUrl(meme.url)

await client.sendMessage(message.from, media, {
caption: `😂 ${meme.title}\n👍 ${meme.ups} upvotes`
})

}catch(err){

message.reply("❌ Couldn't fetch meme")

}

}
