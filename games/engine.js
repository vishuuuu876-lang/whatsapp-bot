export const games = {}

/* CREATE GAME */

export function createGame(chat,type,host,mode="single"){

if(games[chat]) return "game-exists"

games[chat] = {
type:type,
host:host,
mode:mode,
players:[host],
started:false,
data:{}
}

return "created"

}


/* JOIN GAME */

export function joinGame(chat,player){

if(!games[chat]) return "no-game"

let game = games[chat]

if(game.started) return "already-started"

if(game.players.includes(player))
return "already-joined"

game.players.push(player)

return "joined"

}


/* LEAVE GAME */

export function leaveGame(chat,player){

if(!games[chat]) return "no-game"

let game = games[chat]

if(!game.players.includes(player))
return "not-player"

game.players = game.players.filter(p=>p!==player)

if(player === game.host){
delete games[chat]
return "host-left"
}

if(game.players.length===0){
delete games[chat]
return "empty"
}

return "left"

}


/* START GAME */

export function startGame(chat,player){

if(!games[chat]) return "no-game"

let game = games[chat]

if(player !== game.host)
return "not-host"

if(game.started)
return "already-started"

game.started = true

return "started"

}


/* END GAME */

export function endGame(chat,player){

if(!games[chat]) return "no-game"

let game = games[chat]

if(player !== game.host)
return "not-host"

delete games[chat]

return "ended"

}


/* GET PLAYERS */

export function getPlayers(chat){

if(!games[chat]) return []

return games[chat].players

}


/* GAME STATUS */

export function gameStatus(chat){

if(!games[chat]) return null

return games[chat]

}
