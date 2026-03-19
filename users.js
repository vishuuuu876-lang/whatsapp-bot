import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const DATA_DIR  = "./data"
const USER_FILE = join(DATA_DIR, "users.json")

if(!existsSync(DATA_DIR)){
    mkdirSync(DATA_DIR, { recursive: true })
}

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

function saveUsers(users) {
    try {
        writeFileSync(USER_FILE, JSON.stringify(users, null, 2))
    } catch(err) {
        console.error("❌ Failed to save users.json:", err.message)
    }
}

const users = loadUsers()

export function registerUser(message) {
    try {
        // fix: guard against undefined message.from
        if(!message || !message.from) return

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

export function getUserCount() {
    return Object.keys(users).length
}

export function getAllUsers() {
    return Object.values(users)
}

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
