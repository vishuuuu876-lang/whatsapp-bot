import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const DATA_DIR  = "./data"
const USER_FILE = join(DATA_DIR, "users.json")

/* Create data folder if it doesn't exist */
if(!existsSync(DATA_DIR)){
    mkdirSync(DATA_DIR, { recursive: true })
}

/* Load existing users from disk */
function loadUsers() {
    try {
        if(existsSync(USER_FILE)){
            return JSON.parse(readFileSync(USER_FILE, "utf-8"))
        }
    } catch(err) {
        console.error("❌ Failed to load users.json:", err.message)
    }
    return {}
}

/* Save users to disk */
function saveUsers(users) {
    try {
        writeFileSync(USER_FILE, JSON.stringify(users, null, 2))
    } catch(err) {
        console.error("❌ Failed to save users.json:", err.message)
    }
}

/* In-memory store loaded from disk on startup */
const users = loadUsers()

/* Register a user on every message */
export function registerUser(message) {
    try {
        const id    = message.author || message.from
        const isGrp = message.from.endsWith("@g.us")
        const now   = new Date().toISOString()

        if(users[id]){
            users[id].lastSeen     = now
            users[id].messageCount = (users[id].messageCount || 0) + 1
        } else {
            users[id] = {
                id,
                number:       id.replace("@c.us", "").replace("@g.us", ""),
                firstSeen:    now,
                lastSeen:     now,
                messageCount: 1,
                isGroup:      isGrp
            }
            console.log(`👤 New user: ${id.split("@")[0]}`)
        }

        saveUsers(users)
    } catch(err) {
        console.error("❌ registerUser error:", err.message)
    }
}

/* Get total user count */
export function getUserCount() {
    return Object.keys(users).length
}

/* Get all users as array */
export function getAllUsers() {
    return Object.values(users)
}

/* Get N most recently active users */
export function getRecentUsers(n = 10) {
    return Object.values(users)
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        .slice(0, n)
}

/* Summary string for .users command */
export function getUserSummary() {
    const all      = Object.values(users)
    const total    = all.length
    const grpUsers = all.filter(u => u.isGroup).length
    const dmUsers  = all.filter(u => !u.isGroup).length

    const today = all.filter(u => {
        return new Date().toDateString() === new Date(u.lastSeen).toDateString()
    }).length

    const recent = all
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        .slice(0, 5)
        .map((u, i) => `${i+1}. +${u.number} (${u.messageCount} msgs)`)
        .join("\n")

    return (
`👥 *Bot User Stats*

━━━━━━━━━━━━━━
📊 Total users: *${total}*
🟢 Active today: *${today}*
👥 From groups: *${grpUsers}*
💬 From DMs: *${dmUsers}*
━━━━━━━━━━━━━━
🕐 *Recently Active:*
${recent || "No users yet"}
━━━━━━━━━━━━━━`
    )
}
