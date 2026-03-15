export default async function(client, message){

const words = ["javascript","whatsapp","programming","telegram","internet"]

const word = words[Math.floor(Math.random()*words.length)]

const scrambled = word
.split("")
.sort(()=>Math.random()-0.5)
.join("")

message.reply(`🔤 Unscramble this word:

${scrambled}`)
}
