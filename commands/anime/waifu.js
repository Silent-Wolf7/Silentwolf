import fetch from "node-fetch";

export default {
    name: "waifu",
    alias: ["waifupic"],
    desc: "Get a random anime waifu image",
    category: "Anime",
    usage: ".waifu",

    async execute(sock, m) {
        try {
            const jid = m.key.remoteJid;

            // Fetch waifu image
            const res = await fetch("https://api.waifu.pics/sfw/waifu");
            const data = await res.json();

            if (!data || !data.url) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ Failed to fetch waifu image." },
                    { quoted: m }
                );
            }

            // Send image
            await sock.sendMessage(
                jid,
                {
                    image: { url: data.url },
                    caption: "🐺 *WolfBot Waifu* 🐺\nRandom anime waifu for you ✨"
                },
                { quoted: m }
            );

        } catch (error) {
            console.error("Waifu command error:", error);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ An error occurred while fetching waifu." },
                { quoted: m }
            );
        }
    }
};
