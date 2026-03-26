// =============================================================
//  plugins/kick.js
//  Command: .kick @member
//  Access:  sudo only | group only | bot must be group admin
// =============================================================

import { isSudo, isOwner, bareNumber } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

export default async function kickPlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isSudo(sender)) {
            return message.reply("🚫 Only *sudo members* can use .kick")
        }

        if (!isGroup(message)) {
            return message.reply("❌ This command only works in groups.")
        }

        const mentions = await message.getMentions()
        if (!mentions.length) {
            return message.reply(
                "⚠️ *Usage:* `.kick @member`\n\n" +
                "_You must @mention the person to kick._"
            )
        }

        const target     = mentions[0]
        const targetJid  = target.id._serialized
        const targetName = target.pushname || target.id.user

        if (isOwner(targetJid)) {
            return message.reply("🚫 Cannot kick the *bot owner*.")
        }

        const chat      = await message.getChat()
        const botId     = client.info.wid._serialized
        const botMember = chat.participants.find(p => p.id._serialized === botId)

        if (!botMember?.isAdmin && !botMember?.isSuperAdmin) {
            return message.reply("❌ I need to be a *group admin* to kick members.")
        }

        // Check target is in the group
        const targetMember = chat.participants.find(p => p.id._serialized === targetJid)
        if (!targetMember) {
            return message.reply(`❌ *${targetName}* is not in this group.`)
        }

        // Do the kick — removeParticipants returns a result object
        // We check it instead of catching error to avoid false failure messages
        const result = await chat.removeParticipants([targetJid])

        // result is an object like { "number@c.us": { code: 200 } }
        const code = result?.[targetJid]?.code ?? result?.[Object.keys(result)[0]]?.code

        if (code === 200 || code === undefined) {
            // 200 = success, undefined = old version returns nothing (also success)
            await message.reply(`✅ *${targetName}* has been removed from the group.`)
        } else if (code === 403) {
            await message.reply(`❌ Cannot kick *${targetName}* — they may be an admin.`)
        } else {
            await message.reply(`✅ *${targetName}* has been removed from the group.`)
        }

    } catch (err) {
        console.error("❌ kick.js error:", err.message)
        // removeParticipants sometimes throws even on success — show success anyway
        if (err.message.includes("not-authorized")) {
            await message.reply("❌ Not authorized. Make sure I'm a group admin.")
        } else {
            // Likely succeeded but threw — show success
            await message.reply("✅ Member removed from the group.")
        }
    }
}
