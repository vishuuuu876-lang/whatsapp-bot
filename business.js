export const businessSessions = {}

const number = "918088900966"

const mainMenu =
`╭━━━━━━━━━━━━━━━━━━╮
   💼 *Business Services*
╰━━━━━━━━━━━━━━━━━━╯

Grow your business with WhatsApp automation! 🚀

*Choose what interests you:*

1️⃣ Get a bot for your business
2️⃣ Send product & business notifications
3️⃣ Let customers order via WhatsApp
4️⃣ Full business bot setup & support

━━━━━━━━━━━━━━
_Reply a number to learn more_
_Reply 0 to close_`

const pages = {
    "1": {
        text:
`🤖 *WhatsApp Business Bot*

Turn WhatsApp into your #1 business tool!

✅ Auto-reply to customer queries 24/7
✅ Handle orders without any staff
✅ Send menus, catalogs & price lists
✅ Collect customer details automatically
✅ Works for any business — shop, salon,
   restaurant, clinic, real estate & more

━━━━━━━━━━━━━━
💬 Tap below to get started:
`,
        link: `https://wa.me/${number}?text=${encodeURIComponent("Hi! I'm interested in getting a WhatsApp bot for my business 🤖")}`
    },
    "2": {
        text:
`📢 *Business Notifications via WhatsApp*

Keep your customers informed — automatically!

✅ Send order updates & confirmations
✅ Broadcast promotions & flash offers
✅ Notify about new products or services
✅ Schedule messages in advance
✅ Reach thousands of customers instantly

━━━━━━━━━━━━━━
💬 Tap below to get started:
`,
        link: `https://wa.me/${number}?text=${encodeURIComponent("Hi! I want to send business notifications through WhatsApp 📢")}`
    },
    "3": {
        text:
`🛒 *WhatsApp Ordering System*

Let customers order directly on WhatsApp!

✅ Browse your products or menu via chat
✅ Place orders through simple messages
✅ Auto collect name, address & payment info
✅ Get instant order alerts on your phone
✅ No app downloads needed for customers

━━━━━━━━━━━━━━
💬 Tap below to get started:
`,
        link: `https://wa.me/${number}?text=${encodeURIComponent("Hi! I want to set up a WhatsApp ordering system for my business 🛒")}`
    },
    "4": {
        text:
`⚙️ *Full Business Bot Setup & Support*

We handle everything end to end!

✅ Custom bot built for your exact needs
✅ Full setup & deployment included
✅ Ongoing support & maintenance
✅ Training for you & your team
✅ Affordable pricing for any budget

━━━━━━━━━━━━━━
💬 Tap below to get started:
`,
        link: `https://wa.me/${number}?text=${encodeURIComponent("Hi! I want a full business bot setup and support ⚙️")}`
    }
}

export default async function(client, message, args){

    const input = message.body.trim()
    const chat  = message.from

    /* OPEN MENU */
    if(input.toLowerCase() === ".business"){
        businessSessions[chat] = "menu"
        return message.reply(mainMenu)
    }

    /* NO ACTIVE SESSION */
    if(!businessSessions[chat]) return

    /* CLOSE */
    if(input === "0"){
        delete businessSessions[chat]
        return message.reply(
`👋 Thanks for your interest!

Type *.business* anytime to open the menu again.

📞 Or reach us directly:
🔗 https://wa.me/${number}`)
    }

    /* BACK TO MAIN MENU */
    if(input.toLowerCase() === "back"){
        businessSessions[chat] = "menu"
        return message.reply(mainMenu)
    }

    /* PAGE SELECTION */
    if(pages[input]){
        const page = pages[input]
        businessSessions[chat] = input

        return message.reply(
            `${page.text}` +
            `🔗 ${page.link}\n\n` +
            `━━━━━━━━━━━━━━\n` +
            `_Reply *back* to return to menu_\n` +
            `_Reply *0* to close_`
        )
    }

    /* INVALID INPUT */
    return message.reply(
`⚠️ Please choose a valid option:

1️⃣ Get a bot for your business
2️⃣ Business notifications
3️⃣ WhatsApp ordering system
4️⃣ Full setup & support

_Reply 0 to close_`)
}
