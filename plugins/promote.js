// =============================================================
//  plugins/promote.js
//  Commands:
//    .promote @member  — promote to WhatsApp group admin
//    .demote  @member  — remove admin role
//  Access:  sudo only | group only | bot must be group admin
// =============================================================
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
        const botId     = client.info.wid._serialized
        const botMember = chat.participants.find(p => p.id._serialized === botId)

        if (!botMember) {
            return message.reply("❌ I couldn't find myself in this group. Try again.")
        }

        if (!botMember.isAdmin && !botMember.isSuperAdmin) {
            return message.reply("❌ I need to be a *group admin* to promote/demote members.\n\nGo to group info → hold my name → Make admin")
        }

        const isDemote   = message.body.trim().toLowerCase().startsWith(".demote")
        const target     = mentions[0]
        const targetJid  = target.id._serialized
        const targetName = target.pushname || target.id.user

        // Check target is actually in the group
        const targetMember = chat.participants.find(p => p.id._serialized === targetJid)
        if (!targetMember) {
            return message.reply(`❌ @${target.id.user} is not in this group.`, { mentions: [targetJid] })
        }

        if (isDemote) {
            // Check they're actually an admin before demoting
            if (!targetMember.isAdmin && !targetMember.isSuperAdmin) {
                return message.reply(`⚠️ *${targetName}* is not an admin.`, { mentions: [targetJid] })
            }
            await chat.revokeParticipantsAdmin([targetJid])
            await message.reply(`⬇️ *${targetName}* has been demoted from admin.`, { mentions: [targetJid] })
        } else {
            // Check they're not already an admin
            if (targetMember.isAdmin || targetMember.isSuperAdmin) {
                return message.reply(`⚠️ *${targetName}* is already an admin.`, { mentions: [targetJid] })
            }
            await chat.makeParticipantsAdmins([targetJid])
            await message.reply(`⬆️ *${targetName}* has been promoted to group admin! 🎉`, { mentions: [targetJid] })
        }

    } catch (err) {
        console.error("❌ promote.js error:", err.message)
        // More specific error messages
        if (err.message.includes("not-authorized")) {
            await message.reply("❌ Not authorized. Make sure I'm a group admin.")
        } else if (err.message.includes("participant")) {
            await message.reply("❌ Could not find that participant.")
        } else {
            await message.reply(`⚠️ Failed: ${err.message}`)
        }
    }
}
