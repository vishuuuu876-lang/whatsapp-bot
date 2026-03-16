import axios from "axios"

export default async function(client,message,args){

try{

const res = await axios.get("https://meme-api.com/gimme")

const meme = res.data

await client.sendMessage(message.from, meme.url, {
caption:`😂 ${meme.title}`
})

}catch{

message.reply("Couldn't fetch meme")

}

}
