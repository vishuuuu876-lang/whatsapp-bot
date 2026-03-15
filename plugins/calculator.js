export default async function (client, message, args) {

    if (args.length === 0) {
        message.reply("Usage: .calculator 5+5")
        return
    }

    const expression = args.join(" ")

    try {

        const result = eval(expression)

        message.reply(`🧮 Calculator\n\n${expression} = ${result}`)

    } catch (err) {

        message.reply("❌ Invalid calculation")

    }

}
