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
export const OWNER_NUMBER = "918088900966"

// In-memory sudo list
const sudoList = new Set()

/** Clean number → keep only digits */
export function bareNumber(jid) {
    if (!jid) return ""
    return jid.toString().replace(/[^0-9]/g, "")
}

/** Check if owner */
export function isOwner(jid) {
    const num = bareNumber(jid)

    // Debug (optional, remove later)
    console.log("🔍 isOwner check:", num, "==", OWNER_NUMBER)

    return num === OWNER_NUMBER
}

/** Check if sudo (owner always included) */
export function isSudo(jid) {
    const num = bareNumber(jid)
    return isOwner(num) || sudoList.has(num)
}

/** Add sudo */
export function addSudo(number) {
    const n = bareNumber(number)
    if (!n) return false
    if (sudoList.has(n)) return false

    sudoList.add(n)
    return true
}

/** Remove sudo */
export function removeSudo(number) {
    const n = bareNumber(number)
    if (!n) return false

    return sudoList.delete(n)
}

/** Get all sudo users */
export function getSudoList() {
    return [...sudoList]
}
