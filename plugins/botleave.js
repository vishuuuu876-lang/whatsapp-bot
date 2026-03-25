// plugins/botleave.js

import { isGroup } from "../helpers.js"

export default async function(client, message) {
    try {
        if (!isGroup(message)) {
            return message.reply("❌ This command only works in groups.")
        }

        const chat = await message.getChat()

        await message.reply("👋 Leaving group...")
        await chat.leave()

    } catch (err) {
        console.error("❌ botleave error:", err.message)
        await message.reply("⚠️ Failed to leave group.")
    }
}
