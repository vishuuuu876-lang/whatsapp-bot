export const games = {};

/* CREATE GAME */
export function createGame(chat, type, host, mode = "single") {

    if (games[chat]) return "game-exists"

    const maxPlayers = {
        tictactoe: 2,
        rps: 2,
        quiz: 50,
        scramble: 50
    }

    games[chat] = {
        type,
        host,
        mode,
        players: [host],
        started: (mode === "single"),
        maxPlayers: maxPlayers[type] || 10,
        data: {}
    }

    return "created"
}

/* JOIN GAME */
export function joinGame(chat, player) {

    const game = games[chat]
    if (!game) return "no-game"

    if (game.players.includes(player)) return "already-joined"

    if (game.started && game.type !== "quiz") return "already-started"

    if (game.players.length >= game.maxPlayers) return "player-limit"

    game.players.push(player)
    return "joined"
}

/* LEAVE GAME */
export function leaveGame(chat, player) {

    const game = games[chat]
    if (!game) return "no-game"

    game.players = game.players.filter(p => p !== player)

    if (player === game.host || game.players.length === 0) {
        delete games[chat]
        return "game-ended"
    }

    return "left"
}

/* START GAME */
export function startGame(chat, player) {

    const game = games[chat]
    if (!game) return "no-game"

    if (player !== game.host) return "not-host"

    if (game.started) return "already-started"

    game.started = true
    return "started"
}

/* END GAME */
export function endGame(chat) {

    if (!games[chat]) return false

    delete games[chat]
    return true
}

/* RESET GAME */
export function resetGame(chat) {

    const game = games[chat]
    if (!game) return false

    game.data = {}
    game.started = true

    return true
}

/* HELPERS */
export function getPlayers(chat) {
    return games[chat]?.players || []
}

export function gameStatus(chat) {
    return games[chat] || null
}
