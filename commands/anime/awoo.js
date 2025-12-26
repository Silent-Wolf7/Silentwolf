import fetch from "node-fetch";

export default {
    name: "awoo",
    alias: ["howl"],
    desc: "Anime awoo / wolf howl reaction",
    category: "Anime",
    usage: ".awoo",

    async execute(sock, m) {
        try {
            const jid = m.key.remoteJid;

            // Fetch awoo image
            const res = await fetch("https://api.waifu.pics/sfw/awoo");
            const data = await res.json();

            if (!data?.url) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ Failed to fetch awoo reaction." },
                    { quoted: m }
                );
            }

            await sock.sendMessage(
                jid,
                {
                    image: { url: data.url },
                    caption: "🐺 *AWOO!* 🐺\nThe wolf answers the moon 🌙✨"
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Awoo command error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ An error occurred while howling." },
                { quoted: m }
            );
        }
    }
};
