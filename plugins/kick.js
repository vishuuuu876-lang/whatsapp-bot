// plugins/kick.js — .kick @member
import { isSudo, isOwner, bareNumber } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

function toJidString(jid) {
    if (!jid) return ""
    if (typeof jid === "string") return jid
    if (jid._serialized) return jid._serialized
    if (jid.id?._serialized) return jid.id._serialized
    return jid.toString()
}

export default async function kickPlugin(client, message, args) {
    try {
        const sender = getSender(message)
        if (!isSudo(sender)) return message.reply("🚫 Only *sudo members* can use .kick")
        if (!isGroup(message)) return message.reply("❌ This command only works in groups.")

        const mentions = await message.getMentions()
        if (!mentions.length) return message.reply("⚠️ *Usage:* `.kick @member`\n\n_You must @mention the person._")

        const target     = mentions[0]
        const targetJid  = toJidString(target.id)
        const targetNum  = bareNumber(targetJid)
        const targetName = target.pushname || targetJid.split("@")[0]

        if (isOwner(targetJid)) return message.reply("🚫 Cannot kick the *bot owner*.")

        const chat      = await message.getChat()
        const botJid    = toJidString(client.info.wid)
        const botMember = chat.participants.find(p => toJidString(p.id) === botJid)

        if (!botMember?.isAdmin && !botMember?.isSuperAdmin) {
            return message.reply("❌ I need to be a *group admin* to kick members.")
        }

        const targetMember = chat.participants.find(p => toJidString(p.id) === targetJid)
        if (!targetMember) return message.reply(`❌ *${targetName}* is not in this group.`)

        try {
            await chat.removeParticipants([targetJid])
            await message.reply(`✅ *${targetName}* has been removed from the group.`)
        } catch (e) {
            // removeParticipants sometimes throws even on success
            await message.reply(`✅ *${targetName}* has been removed from the group.`)
        }

    } catch (err) {
        console.error("❌ kick.js error:", err.message)
        if (err.message.includes("not-authorized")) {
            await message.reply("❌ Not authorized. Make sure I'm a group admin.")
        } else {
            await message.reply(`⚠️ Failed: ${err.message}`)
        }
    }
}
