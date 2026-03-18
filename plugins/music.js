import yts from "yt-search"
import { exec } from "child_process"
import { promisify } from "util"
import { existsSync, unlinkSync, readFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import pkg from "whatsapp-web.js"
const { MessageMedia } = pkg

const execAsync = promisify(exec)

// max audio duration allowed (seconds) — prevents huge files
const MAX_DURATION_SECONDS = 600 // 10 minutes

export default async function(client, message, args){

    if(args.length === 0)
        return message.reply(
            "🎵 Usage: .music song name\nExample: .music believer"
        )

    const query = args.join(" ")

    let tmpFile = null

    try{

        // search for the video
        const search = await yts(query)

        if(!search.videos.length)
            return message.reply("❌ Song not found")

        const video = search.videos[0]

        // guard: skip videos that are too long
        if(video.seconds > MAX_DURATION_SECONDS){
            return message.reply(
                `❌ Song is too long (${video.timestamp})\nMax allowed: 10 minutes`
            )
        }

        await message.reply(
            `🎵 Downloading: ${video.title}\n⏱ Duration: ${video.timestamp}`
        )

        // create a unique temp file path
        tmpFile = join(tmpdir(), `music_${Date.now()}.mp3`)

        // use yt-dlp to download audio — actually works unlike ytdl-core
        const cmd = [
            "yt-dlp",
            "-x",                          // extract audio only
            "--audio-format mp3",          // convert to mp3
            "--audio-quality 5",           // balanced quality/size
            "--no-playlist",               // never download full playlists
            `--output "${tmpFile}"`,        // save to temp file
            `"${video.url}"`
        ].join(" ")

        await execAsync(cmd, { timeout: 60000 })

        // guard: make sure file actually exists after download
        if(!existsSync(tmpFile)){
            return message.reply("❌ Download failed, try again")
        }

        // read file and build MessageMedia object
        const audioData = readFileSync(tmpFile)
        const base64 = audioData.toString("base64")
        const media = new MessageMedia("audio/mpeg", base64, `${video.title}.mp3`)

        await client.sendMessage(message.from, media, {
            sendAudioAsVoice: false        // sends as audio file, not voice note
        })

    }catch(err){

        console.error("Music error:", err.message)

        if(err.message?.includes("yt-dlp")){
            return message.reply("❌ yt-dlp error — the song may be unavailable or region locked")
        }

        if(err.killed || err.signal === "SIGTERM"){
            return message.reply("❌ Download timed out, try a shorter song")
        }

        message.reply("❌ Failed to fetch music")

    }finally{

        // always clean up temp file whether it succeeded or failed
        if(tmpFile && existsSync(tmpFile)){
            try{ unlinkSync(tmpFile) }catch{}
        }

    }

}
