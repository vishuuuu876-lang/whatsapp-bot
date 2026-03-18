const number = "918088900966"

const menuMessage =
`╭━━━━━━━━━━━━━━━╮
   🤖 *Bot Info*
╰━━━━━━━━━━━━━━━╯

Hey there! 👋 Thanks for using this bot.
Reply with a number to connect with the creator:

1️⃣  Make an ad with this bot
2️⃣  Learn to create this bot
3️⃣  Know about the creator
4️⃣  I'm into coding & learning

━━━━━━━━━━━━━━━
_Reply 1, 2, 3 or 4_`

const responses = {
    "1": {
        label: "📢 Make an Ad",
        text: "Hi! I'd like to make an ad with your bot 🤝",
        note: "Tap the link below to chat with the creator about ads:"
    },
    "2": {
        label: "🎓 Learn to Create this Bot",
        text: "Hi! I want to learn how to create a WhatsApp bot like yours 🤖",
        note: "Tap the link below to start learning from the creator:"
    },
    "3": {
        label: "👤 Know About the Creator",
        text: "Hi! I'd like to know more about you, the creator 👋",
        note: "Tap the link below to connect with the creator:"
    },
    "4": {
        label: "💻 Into Coding & Learning",
        text: "Hi! I'm into coding and learning — let's connect! 💻",
        note: "Tap the link below to connect with a fellow coder:"
    }
}

// exported so index.js can check if a session is active before routing
export const infoSessions = {}

export default async function(client, message, args){

    const chat = message.from
    const input = message.body.trim()

    /* IF USER IS IN AN ACTIVE INFO SESSION — handle their number reply */
    if(infoSessions[chat]){

        const choice = responses[input]

        // invalid input — remind them of valid options
        if(!choice){
            return message.reply(
`⚠️ Please reply with a number between 1 and 4:

1️⃣  Make an ad with this bot
2️⃣  Learn to create this bot
3️⃣  Know about the creator
4️⃣  I'm into coding & learning`
            )
        }

        // valid choice — clear session and send the link
        delete infoSessions[chat]

        const link = `https://wa.me/${number}?text=${encodeURIComponent(choice.text)}`

        return message.reply(
`✅ *${choice.label}*

${choice.note}

🔗 ${link}

_Tap the link to open a WhatsApp chat with the creator_`
        )
    }

    /* FIRST CALL — show the menu and open a session for this chat */
    infoSessions[chat] = true

    await message.reply(menuMessage)
}
