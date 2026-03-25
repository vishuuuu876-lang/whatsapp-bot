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

export const OWNER_NUMBER = "91XXXXXXXXXX"   // ← CHANGE THIS to your number

const sudoList = new Set()

/** Strip @c.us / @g.us suffix and return bare number */
export function bareNumber(jid) {
    return jid.replace(/@.+$/, "")
}

/** Is this JID/number the hardcoded owner? */
export function isOwner(jid) {
    return bareNumber(jid) === OWNER_NUMBER
}

/** Is this JID a sudo user? (owner always counts) */
export function isSudo(jid) {
    return isOwner(jid) || sudoList.has(bareNumber(jid))
}

/** Add a number to sudo. Returns false if already exists. */
export function addSudo(number) {
    const n = bareNumber(number)
    if (sudoList.has(n)) return false
    sudoList.add(n)
    return true
}

/** Remove a number from sudo. Returns false if not found. */
export function removeSudo(number) {
    return sudoList.delete(bareNumber(number))
}

/** Get all sudo members as array of bare numbers */
export function getSudoList() {
    return [...sudoList]
}
