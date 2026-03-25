// plugins/tagall.js

import { isGroup } from "../helpers.js"

export default async function(client, message) {
    try {
        if (!isGroup(message)) {
            return message.reply("❌ This command only works in groups.")
        }

        const chat = await message.getChat()

        if (!chat.isGroup) {
            return message.reply("❌ Not a group.")
        }

        const participants = chat.participants
        const mentions = participants.map(p => p.id._serialized)

        const text =
            `📢 *Tagging Everyone*\n\n` +
            participants.map(p => `@${p.id.user}`).join(" ")

        await client.sendMessage(message.from, text, { mentions })

    } catch (err) {
        console.error("❌ tagall error:", err.message)
        await message.reply("⚠️ Failed to tag members.")
    }
}
