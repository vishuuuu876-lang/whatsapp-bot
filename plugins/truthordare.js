export default async function(client, message, args){

    const truths = [
        "What is your biggest fear?",
        "Have you ever lied to your best friend?",
        "What is your secret talent?",
        "Who was your first crush?",
        "When did you last fart and blame someone else?",
        "Have you ever checked your phone while on the toilet and stayed way longer than needed?",
        "When did you last pick your nose… be honest 👀",
        "What's your most disgusting habit?",
        "Have you ever eaten food that fell on the floor? 5-second rule or no rule?",
        "When did you last lie just to avoid trouble?",
        "Have you ever ignored a call and then texted 'sorry, I was busy'? 😅",
        "What's something you do that you'd never admit in public?"
    ]

    const dares = [
        "Send a funny emoji to the last person you texted",
        "Say something embarrassing out loud right now",
        "Send a voice message saying hello 👋",
        "Drink a full glass of water in one go",
        "Say 'I love you' to the first person that texts you",
        "Take a selfie and send it here",
        "Google your own name right now",
        "Do 10 push-ups before your next message",
        "Go take a shower 🚿",
        "Brush your teeth 🪥",
        "Sing a song out loud for 30 seconds",
        "Send a voice note of you laughing for 5 seconds"
    ]

    // detect which command triggered this plugin
    const input = message.body.toLowerCase().trim()

    let type

    if(input.startsWith(".truth")){
        type = "truth"
    }
    else if(input.startsWith(".dare")){
        type = "dare"
    }
    else{
        // .tod — random
        type = Math.random() > 0.5 ? "truth" : "dare"
    }

    if(type === "truth"){

        const truth = truths[Math.floor(Math.random() * truths.length)]

        return message.reply(
            `😈 Truth\n\n${truth}`
        )

    } else {

        const dare = dares[Math.floor(Math.random() * dares.length)]

        return message.reply(
            `🔥 Dare\n\n${dare}`
        )

    }

}
