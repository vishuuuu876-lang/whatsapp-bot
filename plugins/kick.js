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

        // Safety: cannot kick the bot owner
        if (isOwner(targetJid)) {
            return message.reply("🚫 Cannot kick the *bot owner*.")
        }

        const chat     = await message.getChat()
        const botId    = client.info.wid._serialized
        const botMember = chat.participants.find(p => p.id._serialized === botId)
        if (!botMember?.isAdmin) {
            return message.reply("❌ I need to be a *group admin* to kick members.")
        }

        await chat.removeParticipants([targetJid])
        await message.reply(`🚫 *${targetName}* has been removed from the group.`, { mentions: [targetJid] })

    } catch (err) {
        console.error("❌ kick.js error:", err.message)
        await message.reply("⚠️ Failed to kick. Make sure I'm a group admin.")
    }
}
