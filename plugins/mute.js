// =============================================================
//  plugins/mute.js
//  Commands:
//    .mute   — only admins can send messages
//    .unmute — everyone can send messages
//  Access:  sudo only | group only | bot must be group admin
// =============================================================

import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

export default async function mutePlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isSudo(sender)) {
            return message.reply("🚫 Only *sudo members* can use .mute / .unmute")
        }

        if (!isGroup(message)) {
            return message.reply("❌ This command only works in groups.")
        }

        const chat     = await message.getChat()
        const botId    = client.info.wid._serialized
        const botMember = chat.participants.find(p => p.id._serialized === botId)
        if (!botMember?.isAdmin) {
            return message.reply("❌ I need to be a *group admin* to mute/unmute.")
        }

        const isUnmute = message.body.trim().toLowerCase().startsWith(".unmute")

        if (isUnmute) {
            await chat.setMessagesAdminsOnly(false)
            await message.reply("🔊 *Group unmuted!*\nAll members can now send messages.")
        } else {
            await chat.setMessagesAdminsOnly(true)
            await message.reply("🔇 *Group muted!*\nOnly admins can send messages now.\n\nType *.unmute* to re-open.")
        }

    } catch (err) {
        console.error("❌ mute.js error:", err.message)
        await message.reply("⚠️ Failed to mute/unmute. Make sure I'm a group admin.")
    }
}
