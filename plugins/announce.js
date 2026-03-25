// =============================================================
//  plugins/announce.js
//  Command: .announce <message>
//  Access:  owner only — sends to ALL groups bot is in
// =============================================================

import { isOwner } from "../sudo.js"
import { getSender } from "../helpers.js"

export default async function announcePlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isOwner(sender)) {
            return message.reply("🚫 Only the *bot owner* can use .announce")
        }

        const text = args.join(" ").trim()
        if (!text) {
            return message.reply(
                "⚠️ *Usage:* `.announce <message>`\n\n" +
                "_Example:_ `.announce Bot will restart in 5 minutes!`"
            )
        }

        const chats  = await client.getChats()
        const groups = chats.filter(c => c.isGroup)

        if (!groups.length) {
            return message.reply("❌ Bot is not in any groups.")
        }

        await message.reply(`📢 Sending to *${groups.length}* group(s)... please wait.`)

        const announceText =
            `📢 *Announcement*\n` +
            `${"─".repeat(25)}\n\n` +
            `${text}\n\n` +
            `${"─".repeat(25)}\n` +
            `_— Bot Owner_`

        let sent = 0, failed = 0

        for (const group of groups) {
            try {
                await client.sendMessage(group.id._serialized, announceText)
                sent++
                await new Promise(r => setTimeout(r, 800))
            } catch (e) {
                failed++
                console.warn(`⚠️ announce failed for ${group.name}:`, e.message)
            }
        }

        await message.reply(`✅ *Done!*\n\n• Delivered: ${sent} group(s)\n• Failed: ${failed} group(s)`)

    } catch (err) {
        console.error("❌ announce.js error:", err.message)
        await message.reply("⚠️ Announcement failed.")
    }
}
