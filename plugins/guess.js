export default async function(client, message, args){

const number = Math.floor(Math.random()*10)+1

let guess = parseInt(args[0])

if(!guess){
message.reply("🎯 Guess a number between 1-10\nExample: .guess 5")
return
}

if(guess === number){
message.reply(`🎉 Correct! The number was ${number}`)
}else{
message.reply(`❌ Wrong! The number was ${number}`)
}

}
