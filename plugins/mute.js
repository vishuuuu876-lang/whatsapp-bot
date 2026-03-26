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

// plugins/mute.js — .mute / .unmute
import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

function toJidString(jid) {
    if (!jid) return ""
    if (typeof jid === "string") return jid
    if (jid._serialized) return jid._serialized
    if (jid.id?._serialized) return jid.id._serialized
    return jid.toString()
}

export default async function mutePlugin(client, message, args) {
    try {
        const sender = getSender(message)
        if (!isSudo(sender)) return message.reply("🚫 Only *sudo members* can use .mute / .unmute")
        if (!isGroup(message)) return message.reply("❌ This command only works in groups.")

        const chat      = await message.getChat()
        const botJid    = toJidString(client.info.wid)
        const botMember = chat.participants.find(p => toJidString(p.id) === botJid)

        if (!botMember?.isAdmin && !botMember?.isSuperAdmin) {
            return message.reply("❌ I need to be a *group admin* to mute/unmute.")
        }

        const isUnmute = message.body.trim().toLowerCase().startsWith(".unmute")

        const setMsgAdmin = chat.setMessagesAdminsOnly?.bind(chat)
            ?? chat.setOnlyAdminsCanSend?.bind(chat)

        if (!setMsgAdmin) {
            return message.reply("❌ Mute not supported in this whatsapp-web.js version.")
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
