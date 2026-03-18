import axios from "axios"
import pkg from "whatsapp-web.js"
const { MessageMedia } = pkg

const API_KEY = process.env.UNSPLASH_KEY

export default async function(client, message, args){

    // guard: warn if API key is not set in Railway environment variables
    if(!API_KEY){
        console.error("UNSPLASH_KEY is not set in environment variables")
        return message.reply("❌ Image search is not configured. Ask the bot owner to set the UNSPLASH_KEY.")
    }

    if(args.length === 0)
        return message.reply("📸 Usage:\n.image space\n.image cute cats")

    const query = args.join(" ")

    try{

        const res = await axios.get(
            "https://api.unsplash.com/search/photos",
            {
                params: {
                    query: query,
                    per_page: 1,
                    orientation: "landscape"
                },
                headers: {
                    Authorization: `Client-ID ${API_KEY}`
                },
                timeout: 10000
            }
        )

        if(!res.data.results || res.data.results.length === 0)
            return message.reply(`❌ No images found for: ${query}`)

        const imageUrl = res.data.results[0].urls.small  // small = ~400px, safer size for WhatsApp

        await message.reply("🔍 Fetching image...")

        // fix: download image manually with axios then build MessageMedia
        // — MessageMedia.fromUrl() can fail on Unsplash CDN URLs
        const imageRes = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
                // some CDNs reject requests without a user-agent
                "User-Agent": "Mozilla/5.0"
            }
        })

        const contentType = imageRes.headers["content-type"] || "image/jpeg"

        // guard: make sure we actually got an image back
        if(!contentType.startsWith("image/")){
            return message.reply("❌ Could not load image, try a different search")
        }

        const base64 = Buffer.from(imageRes.data).toString("base64")
        const media = new MessageMedia(contentType, base64)

        await client.sendMessage(message.from, media, {
            caption: `📸 ${query}`
        })

    }catch(err){

        console.error("Image error:", err.message)

        if(err.response?.status === 401){
            return message.reply("❌ Invalid Unsplash API key")
        }

        if(err.response?.status === 403){
            return message.reply("❌ Unsplash API rate limit reached, try again later")
        }

        if(err.code === "ECONNABORTED"){
            return message.reply("❌ Request timed out, try again")
        }

        message.reply("❌ Failed to fetch image")
    }

}
