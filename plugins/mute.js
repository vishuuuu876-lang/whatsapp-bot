// =============================================================
//  plugins/mute.js
//  Commands:
//    .mute   — only admins can send messages
//    .unmute — everyone can send messages
//  Access:  sudo only | group only | bot must be group admin
// =============================================================

// =============================================================
//  plugins/mute.js
//  Commands: .mute / .unmute
//  Fixed: handles method name differences in whatsapp-web.js 1.23.0
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

        const chat      = await message.getChat()
        const botId     = client.info.wid._serialized
        const botMember = chat.participants.find(p => p.id._serialized === botId)

        if (!botMember?.isAdmin && !botMember?.isSuperAdmin) {
            return message.reply("❌ I need to be a *group admin* to mute/unmute.")
        }

        const isUnmute = message.body.trim().toLowerCase().startsWith(".unmute")

        // whatsapp-web.js 1.23.0 uses setInfoAdminsOnly / setMessagesAdminsOnly
        // Try both names to be safe
        const setMsgAdmin = chat.setMessagesAdminsOnly?.bind(chat)
            ?? chat.setOnlyAdminsCanSend?.bind(chat)

        if (!setMsgAdmin) {
            return message.reply("❌ This whatsapp-web.js version doesn't support mute/unmute.")
        }

        if (isUnmute) {
            await setMsgAdmin(false)
            await message.reply("🔊 *Group unmuted!*\nAll members can now send messages.")
        } else {
            await setMsgAdmin(true)
            await message.reply("🔇 *Group muted!*\nOnly admins can send messages.\n\nType *.unmute* to re-open.")
        }

    } catch (err) {
        console.error("❌ mute.js error:", err.message)
        await message.reply(`⚠️ Failed: ${err.message}`)
    }
}
