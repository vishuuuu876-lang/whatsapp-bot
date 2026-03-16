let quizGame = {}

export default async function(client, message){

const chat = message.from

if(!quizGame[chat]){

const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple")
const data = await res.json()

const q = data.results[0]

const options = [...q.incorrect_answers, q.correct_answer]
.sort(()=>Math.random()-0.5)

quizGame[chat] = q.correct_answer.toLowerCase()

message.reply(`🧠 Quiz Time!

${q.question}

Options:
${options.join("\n")}

Reply with the correct answer.`)

return
}

let answer = message.body.toLowerCase()

if(answer === quizGame[chat]){

message.reply("✅ Correct!")

}else{

message.reply(`❌ Wrong! Correct answer: ${quizGame[chat]}`)

}

delete quizGame[chat]

}
