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

// =============================================================
//  sudo.js  —  Central sudo / owner permission manager
// =============================================================

export const OWNER_NUMBER = "918088900966"   // ← your number (no +, no spaces)

const sudoList = new Set()

/** Clean number: remove everything except digits */
export function bareNumber(jid) {
    if (!jid) return ""
    return jid.toString().replace(/[^0-9]/g, "")
}

/** Check if this is owner */
export function isOwner(jid) {
    return bareNumber(jid) === OWNER_NUMBER
}

/** Check if this is sudo (owner always included) */
export function isSudo(jid) {
    return isOwner(jid) || sudoList.has(bareNumber(jid))
}

/** Add sudo user */
export function addSudo(number) {
    const n = bareNumber(number)
    if (!n) return false
    if (sudoList.has(n)) return false

    sudoList.add(n)
    return true
}

/** Remove sudo user */
export function removeSudo(number) {
    const n = bareNumber(number)
    if (!n) return false

    return sudoList.delete(n)
}

/** Get all sudo users */
export function getSudoList() {
    return [...sudoList]
}
