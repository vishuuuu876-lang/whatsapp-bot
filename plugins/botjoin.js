// plugins/botjoin.js
// plugins/botjoin.js — .botjoin <invite_link>
import { isSudo } from "../sudo.js"
import { getSender } from "../helpers.js"

export default async function botjoinPlugin(client, message, args) {
    try {
        const sender = getSender(message)
        if (!isSudo(sender)) return message.reply("🚫 Only *sudo members* can use .botjoin")

        const link = args[0]
        if (!link) {
            return message.reply(
                "⚠️ *Usage:* `.botjoin <invite_link>`\n\n" +
                "_Example:_ `.botjoin https://chat.whatsapp.com/AbcXyz123`"
            )
        }

        const match = link.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{20,})/)
        if (!match) return message.reply("❌ Invalid invite link format.")

        await message.reply("🔗 Trying to join group...")
        await client.acceptInvite(match[1])
        await message.reply("✅ Successfully joined the group!")

    } catch (err) {
        console.error("❌ botjoin.js error:", err.message)
        if (err.message.toLowerCase().includes("invite")) {
            await message.reply("❌ Invalid or expired invite link.")
        } else {
            await message.reply(`⚠️ Failed: ${err.message}`)
        }
    }
}
