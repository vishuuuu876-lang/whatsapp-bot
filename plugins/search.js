export default async function (client, message, args) {

if (!args.length) {
return message.reply(
"🔎 Usage: .search topic\nExample: .search WhatsApp"
)
}

const query = args.join(" ")

try {

const res = await fetch(
`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
)

const data = await res.json()

if (!data.extract)
return message.reply("❌ No information found")

const summary = data.extract.slice(0,700)

await message.reply(
`📚 *${data.title}*

${summary}...

🔗 ${data.content_urls.desktop.page}`
)

}catch(err){

console.error(err)
message.reply("⚠️ Error fetching information")

}

}
