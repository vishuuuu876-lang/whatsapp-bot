/* Check if message is from a group chat */
export function isGroup(message) {
    return message.from.endsWith("@g.us")
}

/* Get sender ID for both group and private chat */
export function getSender(message) {
    return message.author || message.from
}

/* Get display name from WhatsApp ID */
export function getName(id) {
    return id.split("@")[0]
}

/* Safe send — uses client.sendMessage for group mentions, message.reply for DMs */
export async function send(client, message, text, mentionIds, group) {
    try {
        if(group && mentionIds && mentionIds.length > 0){
            await client.sendMessage(message.from, text, { mentions: mentionIds })
        } else {
            await message.reply(text)
        }
    } catch(err) {
        console.error("send error:", err.message)
        try { await message.reply(text) } catch {}
    }
}
