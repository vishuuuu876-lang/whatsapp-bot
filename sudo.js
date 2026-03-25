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

// ✅ Updated to match your actual WhatsApp JID from debug
export const OWNER_NUMBER = "238740639359208"

const sudoList = new Set([
    "265887329058",
    "6283830066179",
    "256701933458"
])

/** Strip everything except digits */
export function bareNumber(jid) {
    if (!jid) return ""
    return jid.toString().replace(/[^0-9]/g, "")
}

/** Is this JID the owner? */
export function isOwner(jid) {
    return bareNumber(jid) === OWNER_NUMBER
}

/** Is this JID a sudo user? Owner always counts. */
export function isSudo(jid) {
    if (isOwner(jid)) return true
    const num = bareNumber(jid)
    return sudoList.has(num)
}

export function addSudo(number) {
    const n = bareNumber(number)
    if (!n || sudoList.has(n)) return false
    sudoList.add(n)
    return true
}

export function removeSudo(number) {
    const n = bareNumber(number)
    if (!n) return false
    return sudoList.delete(n)
}

export function getSudoList() {
    return [...sudoList]
}
