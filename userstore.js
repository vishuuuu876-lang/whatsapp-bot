import { getUsers, getUserCount, getRecentUsers } from "../userstore.js"

// only the bot owner can see the user list
const OWNER = "918088900966@c.us"

export default async function(client, message, args){

    const sender = message.author || message.from

    /* OWNER ONLY — protect user data */
    if(sender !== OWNER){
        return message.reply("❌ This command is only available to the bot owner")
    }

    const subcommand = args[0]?.toLowerCase()
    const total      = getUserCount()
    const all        = getUsers()
    const recent     = getRecentUsers(10)

    /* .users — summary stats */
    if(!subcommand || subcommand === "stats"){

        const today = all.filter(u => {
            const t = new Date()
            const l = new Date(u.lastSeen)
            return t.toDateString() === l.toDateString()
        }).length

        const thisWeek = all.filter(u => {
            const week = new Date()
            week.setDate(week.getDate() - 7)
            return new Date(u.lastSeen) > week
        }).length

        return message.reply(
`👥 *Bot User Stats*

━━━━━━━━━━━━━━
📊 Total users: *${total}*
🟢 Active today: *${today}*
📅 Active this week: *${thisWeek}*
━━━━━━━━━━━━━━

*.users list* — recent 10 users
*.users all* — all user numbers`)
    }

    /* .users list — recent 10 */
    if(subcommand === "list"){

        if(total === 0)
            return message.reply("📭 No users registered yet")

        const lines = recent.map((u, i) =>
            `${i + 1}. +${u.number}\n   Last: ${new Date(u.lastSeen).toLocaleString()}\n   Messages: ${u.messageCount}`
        ).join("\n\n")

        return message.reply(
`👥 *Recent Users (${recent.length}/${total})*

━━━━━━━━━━━━━━
${lines}
━━━━━━━━━━━━━━`)
    }

    /* .users all — all numbers */
    if(subcommand === "all"){

        if(total === 0)
            return message.reply("📭 No users registered yet")

        const numbers = all.map(u => `+${u.number}`).join("\n")

        return message.reply(
`👥 *All Users (${total})*

━━━━━━━━━━━━━━
${numbers}
━━━━━━━━━━━━━━`)
    }

    return message.reply(
`👥 *Users Commands*

*.users* — show stats
*.users list* — recent 10 users
*.users all* — all user numbers`)
}
