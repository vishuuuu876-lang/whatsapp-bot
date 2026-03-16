import wiki from "wikijs"

export default async function(client,message,args){

if(args.length === 0)
return message.reply("Example:\n.wikipedia black hole")

const query = args.join(" ")

try{

const page = await wiki().page(query)

const summary = await page.summary()

message.reply(summary.substring(0,800) + "...")

}catch{

message.reply("Wikipedia article not found")

}

}
