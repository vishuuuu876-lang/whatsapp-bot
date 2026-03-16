export default async function(client,message,args){

if(!message.hasQuotedMsg)
return message.reply("Reply to an image with .sticker")

const quoted = await message.getQuotedMessage()

if(!quoted.hasMedia)
return message.reply("Reply to an image")

const media = await quoted.downloadMedia()

await client.sendMessage(message.from,media,{
sendMediaAsSticker:true
})

}
