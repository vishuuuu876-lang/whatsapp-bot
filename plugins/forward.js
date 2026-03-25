// =============================================================
//  plugins/forward.js
//  Command: .forward @contact  (reply to the message to forward)
//  Access:  sudo only
//  Usage:   Reply to any message → type .forward @contact
// =============================================================

import { isSudo } from "../sudo.js"
import { getSender } from "../helpers.js"

export default async function forwardPlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isSudo(sender)) {
            return message.reply("🚫 Only *sudo members* can use .forward")
        }

        const quotedMsg = await message.getQuotedMessage().catch(() => null)
        if (!quotedMsg) {
            return message.reply(
                "⚠️ *Usage:*\n" +
                "1. Reply to the message you want to forward\n" +
                "2. Type `.forward @contact`\n\n" +
                "_You must reply to a message AND @mention the recipient._"
            )
        }

        const mentions = await message.getMentions()
        if (!mentions.length) {
            return message.reply(
                "⚠️ Please @mention the person to forward to.\n\n" +
                "_Example: `.forward @919876543210`_"
            )
        }

        const target     = mentions[0]
        const targetJid  = target.id._serialized
        const targetName = target.pushname || target.id.user

        await quotedMsg.forward(targetJid)
        await message.reply(`✅ Message forwarded to *${targetName}*`)

    } catch (err) {
        console.error("❌ forward.js error:", err.message)
        await message.reply("⚠️ Failed to forward the message.")
    }
}
