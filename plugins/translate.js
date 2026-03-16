import axios from "axios"

export default async function(client, message, args){

let text = ""

if(message.hasQuotedMsg){

const quoted = await message.getQuotedMessage()
text = quoted.body

if(args.length === 0)
return message.reply("Example:\n.translate hi")

}else{

if(args.length < 2)
return message.reply("Example:\n.translate hi hello")

text = args.slice(1).join(" ")

}

const lang = args[0]

try{

const res = await axios.get(
`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
)

message.reply(
`🌍 Translation (${lang})

${res.data.responseData.translatedText}`
)

}catch{

message.reply("Translation failed")

}

}
