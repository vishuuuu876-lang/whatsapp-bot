export const activeGames = {}

export function createGame(chat, gameType, host, mode) {

activeGames[chat] = {
type: gameType,
host: host,
mode: mode,
players: [host],
started: false,
data: {}
}

}

export function joinGame(chat, player) {

if(!activeGames[chat]) return false

if(!activeGames[chat].players.includes(player)){
activeGames[chat].players.push(player)
}

return true
}

export function startGame(chat){

if(!activeGames[chat]) return false

activeGames[chat].started = true
return true

}

export function endGame(chat){

delete activeGames[chat]

}
