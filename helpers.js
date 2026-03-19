/**
 * Shared helpers used across all plugins
 */

/**
 * Check if a message is from a group chat
 * Group chat IDs end with @g.us
 * Private chat IDs end with @c.us
 */
export function isGroup(message) {
    return message.from.endsWith("@g.us")
}

/**
 * Get the sender ID correctly for both group and private chat
 * In groups: message.author is the member who sent it
 * In DMs: message.author is undefined, use message.from
 */
export function getSender(message) {
    return message.author || message.from
}

/**
 * Get display name from a WhatsApp ID
 * Strips the @c.us or @g.us suffix
 */
export function getName(id) {
    return id.split("@")[0]
}
