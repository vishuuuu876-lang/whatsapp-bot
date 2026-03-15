export default async function(client, message){

const board = `
❌ | ⭕ | ❌
---------
⭕ | ❌ | ⭕
---------
❌ | ⭕ | ❌
`

message.reply(`🎮 Tic Tac Toe

${board}

(Interactive version coming soon)`)
}
