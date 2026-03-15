export default async function(client, message){

const truths = [
"What is your biggest fear?",
"Have you ever lied to your best friend?",
"What is your secret talent?"
]

const dares = [
"Send a funny emoji",
"Say something embarrassing",
"Send a voice message saying hello"
]

const type = Math.random()>0.5 ? "truth" : "dare"

if(type==="truth"){
const t = truths[Math.floor(Math.random()*truths.length)]
message.reply(`😈 Truth:

${t}`)
}else{
const d = dares[Math.floor(Math.random()*dares.length)]
message.reply(`🔥 Dare:

${d}`)
}

}
