// =============================================================
//  plugins/addsudo.js
//  Commands:
//    .addsudo @mention        — grant sudo (owner only)
//    .addsudo 919876543210    — grant sudo by number (owner only)
//    .removesudo @mention     — revoke sudo (owner only)
//    .removesudo 919876543210 — revoke sudo by number (owner only)
//
//  Supports BOTH @mention AND plain number — fixes the issue
//  where typing a number without @ would fail silently.
// =============================================================

import { isOwner, addSudo, removeSudo, bareNumber, OWNER_NUMBER } from "../sudo.js"
import { getSender } from "../helpers.js"

export default async function addsudoPlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isOwner(sender)) {
            return message.reply("🚫 Only the *bot owner* can grant or revoke sudo access.")
        }

        const isRemove = message.body.trim().toLowerCase().startsWith(".removesudo")

        // ── Try @mention first ────────────────────────────────
        const mentions = await message.getMentions()

        if (mentions.length) {
            const target     = mentions[0]
            const targetNum  = bareNumber(target.id._serialized)
            const targetName = target.pushname || targetNum

            // Safety: cannot modify owner's sudo status
            if (targetNum === OWNER_NUMBER) {
                return message.reply("⚠️ Cannot modify the *bot owner's* sudo status.")
            }

            if (isRemove) {
                const removed = removeSudo(targetNum)
                if (!removed) return message.reply(`⚠️ *${targetName}* is not in the sudo list.`)
                return message.reply(`✅ *${targetName}* removed from sudo list.`)
            } else {
                const added = addSudo(targetNum)
                if (!added) return message.reply(`⚠️ *${targetName}* is already a sudo user.`)
                return message.reply(
                    `✅ *${targetName}* granted sudo access!\n\n` +
                    `They can now use:\n.tagall .botleave .botjoin .forward\n.promote .demote .kick .mute .unmute`
                )
            }
        }

        // ── Fallback: plain number in args ────────────────────
        // Supports: .addsudo 919876543210
        const rawNum = args[0] ? bareNumber(args[0]) : ""

        if (rawNum.length >= 7) {
            if (rawNum === OWNER_NUMBER) {
                return message.reply("⚠️ Cannot modify the *bot owner's* sudo status.")
            }

            if (isRemove) {
                const removed = removeSudo(rawNum)
                if (!removed) return message.reply(`⚠️ +${rawNum} is not in the sudo list.`)
                return message.reply(`✅ +${rawNum} removed from sudo list.`)
            } else {
                const added = addSudo(rawNum)
                if (!added) return message.reply(`⚠️ +${rawNum} is already a sudo user.`)
                return message.reply(
                    `✅ +${rawNum} granted sudo access!\n\n` +
                    `They can now use:\n.tagall .botleave .botjoin .forward\n.promote .demote .kick .mute .unmute`
                )
            }
        }

        // ── No valid target provided ──────────────────────────
        return message.reply(
            `⚠️ *Usage:*\n\n` +
            `*.addsudo @person*\n` +
            `*.addsudo 919876543210*\n\n` +
            `*.removesudo @person*\n` +
            `*.removesudo 919876543210*\n\n` +
            `_@mention or type the full number with country code_`
        )

    } catch (err) {
        console.error("❌ addsudo.js error:", err.message)
        await message.reply("⚠️ Something went wrong.")
    }
}
