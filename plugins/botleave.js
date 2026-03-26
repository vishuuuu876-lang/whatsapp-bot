// plugins/botleave.js — .botleave
import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

export default async function botleavePlugin(client, message, args) {
    try {
        const sender = getSender(message)
        if (!isSudo(sender)) return message.reply("🚫 Only *sudo members* can use .botleave")
        if (!isGroup(message)) return message.reply("❌ This command only works in groups.")

        await message.reply("👋 Goodbye! Leaving this group now...")
        const chat = await message.getChat()
        await chat.leave()

    } catch (err) {
        console.error("❌ botleave.js error:", err.message)
        await message.reply(`⚠️ Failed: ${err.message}`)
    }
}
