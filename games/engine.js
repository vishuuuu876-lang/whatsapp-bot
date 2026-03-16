export const games = {}

export function createGame(chat,type,host,mode){
games[chat] = {
type:type,
host:host,
mode:mode,
players:[host],
started:false,
data:{}
}
}

export function joinGame(chat,player){
if(!games[chat]) return false
if(!games[chat].players.includes(player)){
games[chat].players.push(player)
}
return true
}

export function startGame(chat){
if(!games[chat]) return false
games[chat].started=true
}

export function endGame(chat){
delete games[chat]
}
