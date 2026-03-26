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

// =============================================================
//  plugins/promote.js
//  Commands:
//    .promote @member  — promote to WhatsApp group admin
//    .demote  @member  — remove admin role
//  Access:  sudo only | group only | bot must be group admin
//  Fixed:   uses correct method names for whatsapp-web.js 1.23.0
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

        if (!botMember?.isAdmin && !botMember?.isSuperAdmin) {
            return message.reply(
                "❌ I need to be a *group admin* to promote/demote.\n\n" +
                "_Go to group info → hold my name → Make admin_"
            )
        }

        const isDemote   = message.body.trim().toLowerCase().startsWith(".demote")
        const target     = mentions[0]
        const targetJid  = target.id._serialized
        const targetName = target.pushname || target.id.user

        // Check target is in the group
        const targetMember = chat.participants.find(p => p.id._serialized === targetJid)
        if (!targetMember) {
            return message.reply(`❌ *${targetName}* is not in this group.`)
        }

        if (isDemote) {
            if (!targetMember.isAdmin && !targetMember.isSuperAdmin) {
                return message.reply(`⚠️ *${targetName}* is not an admin.`)
            }
            // Try both method names — 1.23.0 uses demoteParticipants
            if (typeof chat.demoteParticipants === "function") {
                await chat.demoteParticipants([targetJid])
            } else if (typeof chat.revokeParticipantsAdmin === "function") {
                await chat.revokeParticipantsAdmin([targetJid])
            } else {
                return message.reply("❌ This version of whatsapp-web.js doesn't support demote.")
            }
            await message.reply(`⬇️ *${targetName}* has been demoted from admin.`, { mentions: [targetJid] })
        } else {
            if (targetMember.isAdmin || targetMember.isSuperAdmin) {
                return message.reply(`⚠️ *${targetName}* is already an admin.`)
            }
            // Try both method names — 1.23.0 uses promoteParticipants
            if (typeof chat.promoteParticipants === "function") {
                await chat.promoteParticipants([targetJid])
            } else if (typeof chat.makeParticipantsAdmins === "function") {
                await chat.makeParticipantsAdmins([targetJid])
            } else {
                return message.reply("❌ This version of whatsapp-web.js doesn't support promote.")
            }
            await message.reply(`⬆️ *${targetName}* has been promoted to admin! 🎉`, { mentions: [targetJid] })
        }

    } catch (err) {
        console.error("❌ promote.js error:", err.message)
        if (err.message.includes("not-authorized")) {
            await message.reply("❌ Not authorized. Make sure I'm a group admin.")
        } else {
            await message.reply(`⚠️ Failed: ${err.message}`)
        }
    }
}
