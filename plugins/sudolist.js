// =============================================================
//  plugins/sudolist.js
//  Command: .sudolist — show all sudo members
//  Access:  anyone
// =============================================================

import { getSudoList, OWNER_NUMBER } from "../sudo.js"

export default async function sudolistPlugin(client, message, args) {
    try {
        const list = getSudoList()

        let text = `👑 *Bot Owner*\n• +${OWNER_NUMBER}\n\n`

        if (list.length === 0) {
            text += `📋 *Sudo Members*\n_None added yet._\n\n`
        } else {
            text += `📋 *Sudo Members (${list.length})*\n`
            list.forEach((num, i) => { text += `${i + 1}. +${num}\n` })
            text += "\n"
        }

        text += `_Sudo commands: .tagall .botleave .botjoin .forward .promote .kick .mute .unmute_`

        await message.reply(text)

    } catch (err) {
        console.error("❌ sudolist.js error:", err.message)
        await message.reply("⚠️ Could not fetch sudo list.")
    }
}
