import { readFileSync, writeFileSync, existsSync } from "fs"

const FILE = "./data/users.json"

/* Load existing users from disk on startup */
function loadUsers() {
    try {
        if(!existsSync("./data")) {
            import("fs").then(fs => fs.mkdirSync("./data", { recursive: true }))
        }
        if(!existsSync(FILE)) return {}
        return JSON.parse(readFileSync(FILE, "utf-8"))
    } catch(err) {
        console.error("❌ Failed to load users:", err.message)
        return {}
    }
}

/* Save users to disk */
function saveUsers(users) {
    try {
        if(!existsSync("./data")) {
            import("fs").then(fs => fs.mkdirSync("./data", { recursive: true }))
        }
        writeFileSync(FILE, JSON.stringify(users, null, 2))
    } catch(err) {
        console.error("❌ Failed to save users:", err.message)
    }
}

/* In-memory user store — loaded from disk on startup */
const users = loadUsers()

/**
 * Register a user when they interact with the bot
 * @param {string} id     — WhatsApp ID e.g. 1234567890@c.us
 * @param {string} chat   — Chat ID (group or private)
 * @param {boolean} group — Whether message came from a group
 */
export function registerUser(id, chat, group = false) {
    if(!id) return

    const existing = users[id]

    if(!existing) {
        // new user
        users[id] = {
            id,
            number:    id.split("@")[0],
            firstSeen: new Date().toISOString(),
            lastSeen:  new Date().toISOString(),
            messageCount: 1,
            groups: group ? [chat] : [],
            private: !group
        }
        console.log(`👤 New user registered: ${id.split("@")[0]}`)
    } else {
        // returning user — update last seen and message count
        users[id].lastSeen = new Date().toISOString()
        users[id].messageCount = (users[id].messageCount || 0) + 1

        // track which groups they've been seen in
        if(group && !users[id].groups?.includes(chat)) {
            users[id].groups = users[id].groups || []
            users[id].groups.push(chat)
        }
    }

    saveUsers(users)
}

/**
 * Get all registered users
 */
export function getUsers() {
    return Object.values(users)
}

/**
 * Get total user count
 */
export function getUserCount() {
    return Object.keys(users).length
}

/**
 * Get users sorted by most recent activity
 */
export function getRecentUsers(limit = 20) {
    return Object.values(users)
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        .slice(0, limit)
}
