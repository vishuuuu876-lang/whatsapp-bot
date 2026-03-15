export default async function(client, message){

const questions = [
{
q:"What is the capital of India?",
a:"delhi"
},
{
q:"2 + 2 = ?",
a:"4"
},
{
q:"Who created JavaScript?",
a:"brendan eich"
}
]

const q = questions[Math.floor(Math.random()*questions.length)]

message.reply(`🧠 Quiz Time!

${q.q}

Reply with the answer!`)
}
