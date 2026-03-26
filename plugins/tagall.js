// plugins/tagall.js — .tagall [message]
import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

function toJidString(jid) {
    if (!jid) return ""
    if (typeof jid === "string") return jid
    if (jid._serialized) return jid._serialized
    if (jid.id?._serialized) return jid.id._serialized
    return jid.toString()
}

export default async function tagallPlugin(client, message, args) {
    try {
        const sender = getSender(message)
        if (!isSudo(sender)) return message.reply("🚫 Only *sudo members* can use .tagall")
        if (!isGroup(message)) return message.reply("❌ .tagall can only be used in groups.")

        const chat         = await message.getChat()
        const participants = chat.participants
        if (!participants?.length) return message.reply("❌ Could not fetch group members.")

        const customMsg = args.join(" ").trim()
        const mentions  = participants.map(p => toJidString(p.id))
        const tagLines  = participants.map(p => `@${toJidString(p.id).split("@")[0]}`).join(" ")

        const text = (customMsg ? `📢 *${customMsg}*\n\n` : `📢 *Attention everyone!*\n\n`) + tagLines

        await client.sendMessage(message.from, text, { mentions })

    } catch (err) {
        console.error("❌ tagall.js error:", err.message)
        await message.reply(`⚠️ Failed: ${err.message}`)
    }
}
