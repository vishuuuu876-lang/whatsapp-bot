import axios from "axios"

export default async function(client,message,args){

if(args.length === 0)
return message.reply("Example:\n.image space")

const query = args.join(" ")

const url =
`https://source.unsplash.com/1024x1024/?${encodeURIComponent(query)}`

await client.sendMessage(message.from, url, {
caption:`📸 Image result for: ${query}`
})

}
