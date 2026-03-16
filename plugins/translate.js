import axios from "axios"

export default async function(client,message,args){

if(args.length < 2)
return message.reply("Example:\n.translate en hello")

const lang = args[0]
const text = args.slice(1).join(" ")

try{

const res = await axios.get(
`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
)

message.reply(`🌍 Translation:\n\n${res.data.responseData.translatedText}`)

}catch{

message.reply("Translation failed")

}

}
