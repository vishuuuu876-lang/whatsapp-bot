export default async function(client, message, args){

const choices = ["rock","paper","scissors"]
const bot = choices[Math.floor(Math.random()*3)]

const user = args[0]

if(!user){
message.reply("✊ Example: .rps rock")
return
}

if(user === bot){
message.reply(`🤝 Draw!\nYou: ${user}\nBot: ${bot}`)
return
}

if(
(user==="rock" && bot==="scissors") ||
(user==="paper" && bot==="rock") ||
(user==="scissors" && bot==="paper")
){
message.reply(`🎉 You win!\nYou: ${user}\nBot: ${bot}`)
}else{
message.reply(`😢 Bot wins!\nYou: ${user}\nBot: ${bot}`)
}

}
