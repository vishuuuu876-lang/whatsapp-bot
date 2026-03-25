// =============================================================
//  plugins/promote.js
//  Commands:
//    .promote @member  — promote to WhatsApp group admin
//    .demote  @member  — remove admin role
//  Access:  sudo only | group only | bot must be group admin
// =============================================================

import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

export default async function promotePlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isSudo(sender)) {
            return message.reply("🚫 Only *sudo members* can use .promote / .demote")
        }

        if (!isGroup(message)) {
            return message.reply("❌ This command only works in groups.")
        }

        const mentions = await message.getMentions()
        if (!mentions.length) {
            return message.reply(
                "⚠️ *Usage:*\n" +
                "`.promote @member` — make them a group admin\n" +
                "`.demote @member`  — remove their admin role\n\n" +
                "_You must @mention the person._"
            )
        }

        const chat = await message.getChat()

        // Check bot is a group admin
        const botId      = client.info.wid._serialized
        const botMember  = chat.participants.find(p => p.id._serialized === botId)
        if (!botMember?.isAdmin) {
            return message.reply("❌ I need to be a *group admin* to promote/demote members.")
        }

        const isDemote   = message.body.trim().toLowerCase().startsWith(".demote")
        const target     = mentions[0]
        const targetJid  = target.id._serialized
        const targetName = target.pushname || target.id.user

        if (isDemote) {
            await chat.revokeParticipantsAdmin([targetJid])
            await message.reply(`⬇️ *${targetName}* has been demoted from admin.`, { mentions: [targetJid] })
        } else {
            await chat.makeParticipantsAdmins([targetJid])
            await message.reply(`⬆️ *${targetName}* has been promoted to group admin! 🎉`, { mentions: [targetJid] })
        }

    } catch (err) {
        console.error("❌ promote.js error:", err.message)
        await message.reply("⚠️ Failed to promote/demote. Make sure I'm a group admin.")
    }
}
