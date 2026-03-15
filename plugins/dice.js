export default async function(client, message){

const dice = Math.floor(Math.random()*6)+1

message.reply(`🎲 Dice rolled: ${dice}`)

}
