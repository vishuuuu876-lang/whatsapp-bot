import axios from "axios"
import { MessageMedia } from "whatsapp-web.js"

const API_KEY = process.env.UNSPLASH_KEY

export default async function(client, message, args){

if(args.length === 0)
return message.reply("Example:\n.image space")

const query = args.join(" ")

try{

const res = await axios.get(
"https://api.unsplash.com/search/photos",
{
params:{
query: query,
per_page: 1
},
headers:{
Authorization:`Client-ID ${API_KEY}`
}
}
)

if(res.data.results.length === 0)
return message.reply("No images found")

const imageUrl = res.data.results[0].urls.regular

const media = await MessageMedia.fromUrl(imageUrl)

await client.sendMessage(message.from, media, {
caption:`📸 Image result for: ${query}`
})

}catch(err){

console.error(err)
message.reply("❌ Failed to fetch image")

}

}
