import axios from "axios"

export default async function(client, message, args){

    let text = ""

    /* TRANSLATE REPLIED MESSAGE */
    if(message.hasQuotedMsg){

        const quoted = await message.getQuotedMessage()

        if(!quoted.body)
            return message.reply("❌ Reply to a text message to translate it")

        text = quoted.body

    }

    /* TRANSLATE INLINE TEXT — .translate some text here */
    else{

        if(args.length === 0)
            return message.reply(
                "🌍 Usage:\n\n" +
                "Reply to any message with:\n.translate\n\n" +
                "Or type directly:\n.translate bonjour comment ça va"
            )

        text = args.join(" ")
    }

    try{

        // auto-detect source language, always translate to English
        const res = await axios.get(
            "https://api.mymemory.translated.net/get",
            {
                params: {
                    q: text,
                    langpair: "autodetect|en"
                },
                timeout: 8000
            }
        )

        const data = res.data

        // guard against API error responses
        if(data.responseStatus !== 200){
            console.error("MyMemory API error:", data)
            return message.reply("❌ Translation failed, try again")
        }

        const translated = data.responseData?.translatedText

        if(!translated || translated.trim() === ""){
            return message.reply("❌ Could not translate that text")
        }

        // if already English, MyMemory sometimes returns the same text
        if(translated.toLowerCase().trim() === text.toLowerCase().trim()){
            return message.reply(`ℹ️ Text appears to already be in English:\n\n${text}`)
        }

        const detectedLang = data.matches?.[0]?.["match-quality"] || ""

        await message.reply(
            `🌍 Translated to English\n\n${translated}`
        )

    }catch(err){

        console.error("Translate error:", err.message)

        if(err.code === "ECONNABORTED"){
            return message.reply("❌ Translation timed out, try again")
        }

        message.reply("❌ Translation failed")
    }

}
