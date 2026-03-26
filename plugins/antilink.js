// =============================================================
//  plugins/antilink.js
//  Commands:
//    .antilink on   — enable antilink for this group
//    .antilink off  — disable antilink for this group
//    .antilink      — check current status
//  Access:  sudo only | group only | bot must be group admin
//
//  When ON:
//    - Any WhatsApp group invite link posted by a non-admin
//      is deleted and the sender gets a warning
//    - After 3 warnings, the sender is kicked automatically
//  Bot must be group admin for delete + kick to work.
// =============================================================

import { isSudo } from "../sudo.js"
import { isGroup, getSender } from "../helpers.js"

// In-memory store: { "groupJid": { enabled: true, warnings: { "senderJid": count } } }
export const antilinkStore = {}

// WhatsApp invite link patterns
const LINK_PATTERNS = [
    /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
    /whatsapp\.com\/invite\/[A-Za-z0-9]+/i,
]

function hasGroupLink(text) {
    return LINK_PATTERNS.some(p => p.test(text))
}

// ── This is called from index.js for every non-command message ──
// Export so index.js can call it before command processing
export async function checkAntilink(client, message) {
    try {
        if (!isGroup(message)) return false

        const chat   = message.from
        const config = antilinkStore[chat]
        if (!config?.enabled) return false

        const body = message.body || ""
        if (!hasGroupLink(body)) return false

        const sender     = getSender(message)
        const groupChat  = await message.getChat()

        // Admins are exempt
        const senderMember = groupChat.participants.find(p => p.id._serialized === sender)
        if (senderMember?.isAdmin || senderMember?.isSuperAdmin) return false

        // Initialize warnings
        if (!config.warnings[sender]) config.warnings[sender] = 0
        config.warnings[sender]++

        const warnings  = config.warnings[sender]
        const name      = message.author
            ? `@${sender.replace(/[^0-9]/g, "")}`
            : "You"

        // Try to delete the message
        try { await message.delete(true) } catch {}

        if (warnings >= 3) {
            // Kick on 3rd warning
            config.warnings[sender] = 0
            try {
                await groupChat.removeParticipants([sender])
                await client.sendMessage(chat,
                    `🚫 *AntiLink*\n\n` +
                    `${name} was kicked for repeatedly sharing group links.\n` +
                    `_(3/3 warnings)_`,
                    { mentions: [sender] }
                )
            } catch {
                await client.sendMessage(chat,
                    `⚠️ *AntiLink*\n\n` +
                    `${name} sent a group link and has been warned 3 times.\n` +
                    `_I need admin rights to kick them._`,
                    { mentions: [sender] }
                )
            }
        } else {
            await client.sendMessage(chat,
                `⚠️ *AntiLink Warning ${warnings}/3*\n\n` +
                `${name} group links are not allowed here!\n` +
                `_${3 - warnings} more warning(s) before kick._`,
                { mentions: [sender] }
            )
        }

        return true

    } catch (err) {
        console.error("❌ checkAntilink error:", err.message)
        return false
    }
}

// ── Command handler: .antilink on/off ────────────────────────
export default async function antilinkPlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isSudo(sender)) {
            return message.reply("🚫 Only *sudo members* can use .antilink")
        }

        if (!isGroup(message)) {
            return message.reply("❌ This command only works in groups.")
        }

        const chat   = message.from
        const toggle = (args[0] || "").toLowerCase()

        // Show status if no argument
        if (!toggle) {
            const status = antilinkStore[chat]?.enabled ? "🟢 ON" : "🔴 OFF"
            return message.reply(
                `🔗 *AntiLink Status:* ${status}\n\n` +
                `*.antilink on*  — enable\n` +
                `*.antilink off* — disable`
            )
        }

        if (toggle === "on") {
            antilinkStore[chat] = { enabled: true, warnings: {} }
            return message.reply(
                `✅ *AntiLink enabled!*\n\n` +
                `Group invite links will be deleted.\n` +
                `Members get 3 warnings then get kicked.\n\n` +
                `_Make sure I'm a group admin for full functionality._`
            )
        }

        if (toggle === "off") {
            if (antilinkStore[chat]) {
                antilinkStore[chat].enabled = false
                antilinkStore[chat].warnings = {}
            }
            return message.reply("🔴 *AntiLink disabled.*\nMembers can share links again.")
        }

        return message.reply(
            "⚠️ *Usage:*\n" +
            "`.antilink on`  — enable\n" +
            "`.antilink off` — disable\n" +
            "`.antilink`     — check status"
        )

    } catch (err) {
        console.error("❌ antilink.js error:", err.message)
        await message.reply("⚠️ Something went wrong.")
    }
}
