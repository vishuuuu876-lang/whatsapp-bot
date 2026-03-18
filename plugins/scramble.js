import { games, createGame, joinGame, startGame, endGame } from "../games/engine.js"

/* fix: fetch with hard timeout so handler never hangs on slow API */
async function fetchWithTimeout(url, timeoutMs = 8000) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const res = await fetch(url, { signal: controller.signal })
        return res
    } finally {
        clearTimeout(timer)
    }
}

export default async function(client, message, args){

    const input  = message.body.toLowerCase().trim()
    const chat   = message.from
    const sender = message.author || message.from
    const mode   = args[0] || "single"

    /* CREATE GAME */
    if(!games[chat]){

        createGame(chat, "scramble", sender, mode)

        if(mode === "multi"){
            return message.reply(
                `🔤 Word Scramble Lobby\n\n.join to join\n.start to begin`
            )
        }

        startGame(chat, sender)
    }

    let game = games[chat]
    if(!game.data) game.data = {}

    /* JOIN */
    if(input === ".join"){
        const result = joinGame(chat, sender)
        if(result === "already-joined") return message.reply("⚠️ You already joined")
        if(result === "player-limit")   return message.reply("❌ Game is full")
        return message.reply(`Player joined (${game.players.length})`)
    }

    /* START */
    if(input.startsWith(".start")){

        if(sender !== game.host)
            return message.reply("❌ Only the host can start")

        if(game.mode === "multi"){
            const result = startGame(chat, sender)
            if(result !== "started") return message.reply("⚠️ Could not start game")
        }

        await message.reply("🔤 Fetching word...")

        try {

            // fix: 8 second timeout on word API
            const res = await fetchWithTimeout(
                "https://random-word-api.herokuapp.com/word",
                8000
            )

            if(!res.ok) throw new Error("API error")

            const data = await res.json()

            if(!data || !data[0]) throw new Error("Empty response")

            const word = data[0]

            // scramble with up to 10 attempts to get a different arrangement
            let scrambled = word
            for(let i = 0; i < 10; i++){
                const temp = word.split("").sort(() => Math.random() - 0.5).join("")
                if(temp !== word){
                    scrambled = temp
                    break
                }
            }

            game.data.word = word

            await message.reply(`🔤 Unscramble this word:\n\n*${scrambled}*\n\n_Type your answer_`)

        } catch(err) {

            endGame(chat)

            if(err.name === "AbortError"){
                console.error("Scramble fetch timed out")
                return message.reply("❌ Word API timed out. Try .scramble again.")
            }

            console.error("Scramble fetch error:", err.message)
            return message.reply("❌ Failed to fetch word. Game cancelled.")
        }

        return
    }

    /* GAME INPUT */
    if(!game.started) return

    if(!game.data.word){
        return message.reply("⏳ Waiting for the game to start...")
    }

    if(game.mode === "multi" && !game.players.includes(sender)) return

    if(input.startsWith(".")) return

    if(input === game.data.word){
        await message.reply(
            `🎉 ${sender.split("@")[0]} solved it!\nWord: *${game.data.word}*`
        )
        endGame(chat)
    }

}
