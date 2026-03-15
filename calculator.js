module.exports = async (client, message, args) => {

    const math = require("mathjs")

    try {
        const result = math.evaluate(args.join(" "))
        message.reply(`🧮 Result: ${result}`)
    } catch {
        message.reply("Invalid calculation")
    }

}
