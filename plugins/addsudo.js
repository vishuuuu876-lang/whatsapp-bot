// =============================================================
//  plugins/addsudo.js
//  Commands:
//    .addsudo @person    — grant sudo access  (owner only)
//    .removesudo @person — revoke sudo access (owner only)
//  Access:  bot owner only
// =============================================================

import { isOwner, addSudo, removeSudo, bareNumber } from "../sudo.js"
import { getSender } from "../helpers.js"

export default async function addsudoPlugin(client, message, args) {
    try {
        const sender = getSender(message)

        if (!isOwner(sender)) {
            return message.reply("🚫 Only the *bot owner* can grant or revoke sudo access.")
        }

        const mentions = await message.getMentions()
        if (!mentions.length) {
            return message.reply(
                "⚠️ *Usage:*\n" +
                "`.addsudo @person`    — grant sudo\n" +
                "`.removesudo @person` — revoke sudo\n\n" +
                "_You must @mention the person._"
            )
        }

        const target     = mentions[0]
        const targetNum  = bareNumber(target.id._serialized)
        const targetName = target.pushname || targetNum
        const isRemove   = message.body.trim().toLowerCase().startsWith(".removesudo")

        if (isRemove) {
            const removed = removeSudo(targetNum)
            if (!removed) return message.reply(`⚠️ @${targetNum} is not in the sudo list.`, { mentions: [target.id._serialized] })
            return message.reply(`✅ *${targetName}* removed from sudo list.`, { mentions: [target.id._serialized] })
        } else {
            const added = addSudo(targetNum)
            if (!added) return message.reply(`⚠️ *${targetName}* is already a sudo user.`, { mentions: [target.id._serialized] })
            return message.reply(
                `✅ *${targetName}* has been granted sudo access!\n\n` +
                `They can now use:\n.tagall .botleave .botjoin .forward\n.promote .demote .kick .mute .unmute .announce`,
                { mentions: [target.id._serialized] }
            )
        }

    } catch (err) {
        console.error("❌ addsudo.js error:", err.message)
        await message.reply("⚠️ Something went wrong.")
    }
}
