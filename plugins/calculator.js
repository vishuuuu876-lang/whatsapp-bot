export default async function (client, message, args) {

if(args.length === 0){
message.reply("Usage: .calculator 5+5")
return
}

const expression = args.join("")

/* allow only numbers and math operators */

if(!/^[0-9+\-*/().]+$/.test(expression)){
return message.reply("❌ Only numbers and math operators allowed")
}

try{

const result = Function(`"use strict"; return (${expression})`)()

message.reply(
`🧮 Calculator

${expression} = ${result}`
)

}catch{

message.reply("❌ Invalid calculation")

}

}
