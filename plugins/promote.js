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

// =============================================================
//  plugins/promote.js
//  Commands:
//    .promote @member  — promote to WhatsApp group admin
//    .demote  @member  — remove admin role
//  Access:  sudo only | group only | bot must be group admin
// =============================================================

import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

/** Safely convert any JID format to a plain string */
function toJidString(jid) {
    if (!jid) return ""
    if (typeof jid === "string") return jid
    if (jid._serialized) return jid._serialized
    if (jid.id?._serialized) return jid.id._serialized
    return jid.toString()
}

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
        const botJid    = toJidString(client.info.wid)
        const botMember = chat.participants.find(p => toJidString(p.id) === botJid)

        if (!botMember?.isAdmin && !botMember?.isSuperAdmin) {
            return message.reply(
                "❌ I need to be a *group admin* to promote/demote.\n\n" +
                "_Go to group info → hold my name → Make admin_"
            )
        }

        const isDemote   = message.body.trim().toLowerCase().startsWith(".demote")
        const target     = mentions[0]
        // Safely extract JID string
        const targetJid  = toJidString(target.id)
        const targetNum  = targetJid.split("@")[0]
        const targetName = target.pushname || targetNum

        // Check target is in the group
        const targetMember = chat.participants.find(p => toJidString(p.id) === targetJid)
        if (!targetMember) {
            return message.reply(`❌ *${targetName}* is not in this group.`)
        }

        if (isDemote) {
            if (!targetMember.isAdmin && !targetMember.isSuperAdmin) {
                return message.reply(`⚠️ *${targetName}* is not an admin.`)
            }
            // Try all known method names across versions
            if (typeof chat.demoteParticipants === "function") {
                await chat.demoteParticipants([targetJid])
            } else if (typeof chat.revokeParticipantsAdmin === "function") {
                await chat.revokeParticipantsAdmin([targetJid])
            } else {
                return message.reply("❌ Demote not supported in this version.")
            }
            await message.reply(
                `⬇️ *${targetName}* has been demoted from admin.\n\n` +
                `👑 *Demoted by:* @${sender.split("@")[0]}\n` +
                `📅 ${new Date().toLocaleString()}`,
                { mentions: [targetJid, sender] }
            )
        } else {
            if (targetMember.isAdmin || targetMember.isSuperAdmin) {
                return message.reply(`⚠️ *${targetName}* is already an admin.`)
            }
            // Try all known method names across versions
            if (typeof chat.promoteParticipants === "function") {
                await chat.promoteParticipants([targetJid])
            } else if (typeof chat.makeParticipantsAdmins === "function") {
                await chat.makeParticipantsAdmins([targetJid])
            } else {
                return message.reply("❌ Promote not supported in this version.")
            }
            await message.reply(
                `⬆️ *${targetName}* has been promoted to admin! 🎉\n\n` +
                `👑 *Promoted by:* @${sender.split("@")[0]}\n` +
                `📅 ${new Date().toLocaleString()}`,
                { mentions: [targetJid, sender] }
            )
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
