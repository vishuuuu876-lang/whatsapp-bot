export default async function(client, message, args){

if(args.length === 0){
return message.reply(
"🎯 Guess a number between 1-10\nExample: .guess 5"
)
}

const guess = parseInt(args[0])

if(isNaN(guess) || guess < 1 || guess > 10){
return message.reply("❌ Enter a number between 1 and 10")
}

const number = Math.floor(Math.random()*10)+1

if(guess === number){
return message.reply(`🎉 Correct! The number was ${number}`)
}

if(guess > number){
return message.reply(`📉 Too high! The number was ${number}`)
}

if(guess < number){
return message.reply(`📈 Too low! The number was ${number}`)
}

}
