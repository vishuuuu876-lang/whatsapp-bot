export default async function (client, message) {

const dice = Math.floor(Math.random() * 6) + 1

const diceEmoji = ["⚀","⚁","⚂","⚃","⚄","⚅"]

await message.reply(
`🎲 Dice Roll

Number: ${dice}
Face: ${diceEmoji[dice-1]}`
)

}
