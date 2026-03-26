// =============================================================
//  plugins/jid.js
//  Command: .jid            — shows YOUR own JID
//           .jid @person    — shows that person's JID
//           reply + .jid    — shows the replied message sender's JID
//  Access:  owner only (sensitive info)
// =============================================================

// plugins/jid.js — .jid / .jid @person / reply+.jid (owner only)
import { isOwner } from "../sudo.js"
import { getSender } from "../helpers.js"

function toJidString(jid) {
    if (!jid) return ""
    if (typeof jid === "string") return jid
    if (jid._serialized) return jid._serialized
    if (jid.id?._serialized) return jid.id._serialized
    return jid.toString()
}

export default async function jidPlugin(client, message, args) {
    try {
        const sender = getSender(message)
        if (!isOwner(sender)) return message.reply("🚫 Only the *bot owner* can use .jid")

        // Option 1: reply to a message
        const quoted = await message.getQuotedMessage().catch(() => null)
        if (quoted) {
            const jid = quoted.author || quoted.from
            const num = jid.replace(/[^0-9]/g, "")
            return message.reply(
                `🔍 *JID from replied message*\n\n` +
                `Full JID: ${jid}\n` +
                `Bare number: ${num}\n\n` +
                `_Use \`${num}\` in sudo.js or .addsudo_`
            )
        }

        // Option 2: @mention someone
        const mentions = await message.getMentions()
        if (mentions.length) {
            const target = mentions[0]
            const jid    = toJidString(target.id)
            const num    = jid.replace(/[^0-9]/g, "")
            const name   = target.pushname || jid.split("@")[0]
            return message.reply(
                `🔍 *JID of ${name}*\n\n` +
                `Full JID: ${jid}\n` +
                `Bare number: ${num}\n\n` +
                `_Use \`${num}\` in sudo.js or .addsudo_`
            )
        }

        // Option 3: your own JID
        const myJid = getSender(message)
        const myNum = myJid.replace(/[^0-9]/g, "")
        return message.reply(
            `🔍 *Your JID*\n\n` +
            `Full JID: ${myJid}\n` +
            `Bare number: ${myNum}\n\n` +
            `_Use \`${myNum}\` as OWNER_NUMBER in sudo.js_`
        )

    } catch (err) {
        console.error("❌ jid.js error:", err.message)
        await message.reply(`⚠️ Failed: ${err.message}`)
    }
}
