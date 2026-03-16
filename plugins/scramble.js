let scrambleGame = {}

export default async function(client, message){

const chat = message.from

const words = ["javascript","whatsapp","programming","internet","telegram"]

if(!scrambleGame[chat]){

let word = words[Math.floor(Math.random()*words.length)]

let scrambled = word
.split("")
.sort(()=>Math.random()-0.5)
.join("")

scrambleGame[chat] = word

message.reply(`🔤 Unscramble this word:

${scrambled}`)

return
}

let guess = message.body.toLowerCase()

if(guess === scrambleGame[chat]){

message.reply("🎉 Correct word!")

}else{

message.reply(`❌ Wrong! Word was: ${scrambleGame[chat]}`)

}

delete scrambleGame[chat]

}
