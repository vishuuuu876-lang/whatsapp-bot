import axios from "axios"

export default async function(client, message, args){

let text = ""
let lang = args[0]

/* TRANSLATE REPLIED MESSAGE */

if(message.hasQuotedMsg){

const quoted = await message.getQuotedMessage()

if(!quoted.body)
return message.reply("Reply to a text message")

text = quoted.body

if(!lang)
return message.reply("Example:\n.translate hi")

}

/* NORMAL TRANSLATION */

else{

if(args.length < 2)
return message.reply("Example:\n.translate hi hello")

lang = args[0]
text = args.slice(1).join(" ")

}

try{

const res = await axios.get(
`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
)

const translated = res.data.responseData.translatedText

await message.reply(
`🌍 Translation (${lang})

${translated}`
)

}catch(err){

console.error(err)
message.reply("❌ Translation failed")

}

}
