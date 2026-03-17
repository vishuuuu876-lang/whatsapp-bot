export default async function(client, message){

const truths = [
"What is your biggest fear?",
"Have you ever lied to your best friend?",
"What is your secret talent?",
"who is your first kiss",
"when did you fart last time?",
"Have you ever checked your phone while on the toilet and stayed way longer than needed?",
"When did you last pick your nose… be honest 👀",
"What’s your most disgusting habit?",
"Have you ever eaten food that fell on the floor? 5-second rule or no rule?",
"When did you last lie just to avoid trouble?",
"Have you ever ignored a call and then texted “sorry, I was busy”? 😅",
"What’s something you do that you’d never admit in public?"
]
  

const dares = [
"Send a funny emoji",
"Say something embarrassing",
"Send a voice message saying hello👋🏻",
"Try farting now",
"Drink a glass of water",
"say i love you to the first person that texts you",
"kiss on your photo",
"Google your name",
"climb a tree🌴",
"Go take a shower🚿",
"Brush your teeth 🪥",
"Sing a song"
]

// allow user choice: .truth / .dare
const input = message.body.toLowerCase().trim()

let type

if(input.includes("truth")){
type = "truth"
}
else if(input.includes("dare")){
type = "dare"
}
else{
type = Math.random() > 0.5 ? "truth" : "dare"
}

if(type === "truth"){

const truth = truths[Math.floor(Math.random() * truths.length)]

return message.reply(
`😈 Truth

${truth}`
)

}else{

const dare = dares[Math.floor(Math.random() * dares.length)]

return message.reply(
`🔥 Dare

${dare}`
)

}

}
