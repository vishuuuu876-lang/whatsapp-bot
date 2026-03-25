// plugins/sudolist.js

import { getSudoList, OWNER_NUMBER } from "../sudo.js"

export default async function(client, message) {
    try {
        const list = getSudoList()

        const formatted = [
            `👑 Owner: +${OWNER_NUMBER}`,
            ...list.map((n, i) => `${i + 1}. +${n}`)
        ]

        return message.reply(
            `🔐 *Sudo Users List*\n\n${formatted.join("\n") || "No sudo users"}`
        )

    } catch (err) {
        console.error("❌ sudolist error:", err.message)
        await message.reply("⚠️ Failed to fetch sudo list.")
    }
}
