// =============================================================
//  sudo.js  —  Central sudo / owner permission manager
//  Place this in ROOT folder (same level as index.js)
// =============================================================
//
//  HOW TO SET YOUR OWNER NUMBER:
//  ─────────────────────────────
//  Replace the number below with YOUR WhatsApp number.
//  Format: country code + number, NO + sign, NO spaces.
//
//  Examples:
//    India  (+91 98765 43210)  →  "919876543210"
//    US     (+1 555 123 4567)  →  "15551234567"
//    UK     (+44 7700 900123)  →  "447700900123"
//
//  The OWNER always has full access automatically.
//
//  NOTE: sudo list resets on bot restart (in-memory).
//  For permanent storage, save getSudoList() to ./data/sudolist.json
//  using the same pattern as users.js.
// =============================================================


// 👉 Put YOUR number here (no +, no spaces)
// =============================================================
//  sudo.js  —  Central sudo / owner permission manager
//  Place this in ROOT folder (same level as index.js)
// =============================================================
//
//  HOW TO SET YOUR OWNER NUMBER:
//  Format: country code + number, NO + sign, NO spaces.
//  India (+91 98765 43210) → "919876543210"
// =============================================================

// =============================================================
//  sudo.js  —  Central sudo / owner permission manager
// =============================================================

// =============================================================
//  sudo.js  —  Central sudo / owner permission manager
// =============================================================

export const OWNER_NUMBER = "238740639359208"  // ← exact debug value

const sudoList = new Set([
    "265887329058",
    "6283830066179",
    "256701933458"
])

/** Strip everything except digits */
export function bareNumber(jid) {
    if (!jid) return ""
    if (typeof jid === "object") {
        jid = jid._serialized || jid.id?._serialized || jid.toString()
    }
    return jid.toString().replace(/[^0-9]/g, "")
}

/** Compare two JIDs by their last 10 digits — handles all format variations */
function matchesNumber(jid, stored) {
    const a = bareNumber(jid)
    const b = bareNumber(stored)
    if (!a || !b) return false
    // Exact match
    if (a === b) return true
    // Match by last 10 digits (handles country code variations)
    const len = Math.min(a.length, b.length, 10)
    return a.slice(-len) === b.slice(-len)
}

/** Is this JID the owner? */
export function isOwner(jid) {
    return matchesNumber(jid, OWNER_NUMBER)
}

/** Is this JID a sudo user? Owner always counts. */
export function isSudo(jid) {
    if (isOwner(jid)) return true
    // Check against every number in sudoList using flexible matching
    for (const stored of sudoList) {
        if (matchesNumber(jid, stored)) return true
    }
    return false
}

/** Add a number to sudo list */
export function addSudo(number) {
    const n = bareNumber(number)
    if (!n) return false
    // Don't add if already matches something in the list
    for (const stored of sudoList) {
        if (matchesNumber(n, stored)) return false
    }
    sudoList.add(n)
    return true
}

/** Remove a number from sudo list */
export function removeSudo(number) {
    const n = bareNumber(number)
    if (!n) return false
    // Find and remove matching entry
    for (const stored of sudoList) {
        if (matchesNumber(n, stored)) {
            sudoList.delete(stored)
            return true
        }
    }
    return false
}

/** Return all sudo members as array of bare numbers */
export function getSudoList() {
    return [...sudoList]
}
