import axios from "axios"
import pkg from "whatsapp-web.js"
const { MessageMedia } = pkg

export default async function(client, message, args){

    try{

        const res = await axios.get("https://meme-api.com/gimme", {
            timeout: 10000
        })

        const meme = res.data

        // guard: make sure API returned valid data
        if(!meme || !meme.url || !meme.title){
            return message.reply("❌ Couldn't fetch meme, try again")
        }

        // fix: download manually instead of MessageMedia.fromUrl() for reliability
        const imageRes = await axios.get(meme.url, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        })

        const contentType = imageRes.headers["content-type"] || "image/jpeg"

        // guard: make sure response is actually an image
        if(!contentType.startsWith("image/")){
            return message.reply("❌ Meme image could not be loaded, try again")
        }

        const base64 = Buffer.from(imageRes.data).toString("base64")
        const media = new MessageMedia(contentType, base64)

        await client.sendMessage(message.from, media, {
            caption: `😂 ${meme.title}\n👍 ${meme.ups} upvotes`
        })

    }catch(err){

        console.error("Meme error:", err.message)

        if(err.code === "ECONNABORTED"){
            return message.reply("❌ Request timed out, try again")
        }

        message.reply("❌ Couldn't fetch meme, try again")
    }

}
