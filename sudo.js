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

export const OWNER_NUMBER = "918088900966"   // ← your number, already set

// Pre-loaded sudo list — these numbers always have sudo access
// even after bot restarts. Add numbers here directly if needed.
const sudoList = new Set([
    "265887329058",
    "6283830066179",
    "256701933458"
    // add more numbers here if needed
])

/** Strip everything except digits from a JID or number */
export function bareNumber(jid) {
    if (!jid) return ""
    return jid.toString().replace(/[^0-9]/g, "")
}

/** Is this JID/number the hardcoded owner? */
export function isOwner(jid) {
    return bareNumber(jid) === OWNER_NUMBER
}

/** Is this JID/number a sudo user? Owner always counts as sudo. */
export function isSudo(jid) {
    const num = bareNumber(jid)
    return num === OWNER_NUMBER || sudoList.has(num)
}

/** Add a number to sudo list. Returns false if already present. */
export function addSudo(number) {
    const n = bareNumber(number)
    if (!n || sudoList.has(n)) return false
    sudoList.add(n)
    return true
}

/** Remove a number from sudo list. Returns false if not found. */
export function removeSudo(number) {
    const n = bareNumber(number)
    if (!n) return false
    return sudoList.delete(n)
}

/** Return all sudo members as array of bare numbers */
export function getSudoList() {
    return [...sudoList]
}
