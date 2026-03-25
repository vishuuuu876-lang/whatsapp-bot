// plugins/botjoin.js

export default async function(client, message, args) {
    try {
        const link = args[0]

        if (!link) {
            return message.reply("⚠️ Usage: *.botjoin <invite link>*")
        }

        const code = link.split("https://chat.whatsapp.com/")[1]

        if (!code) {
            return message.reply("❌ Invalid invite link.")
        }

        await client.acceptInvite(code)

        return message.reply("✅ Joined the group successfully!")

    } catch (err) {
        console.error("❌ botjoin error:", err.message)
        await message.reply("⚠️ Failed to join group.\nMake sure link is valid & not expired.")
    }
}
