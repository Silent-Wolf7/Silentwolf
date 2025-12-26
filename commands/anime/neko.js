import fetch from "node-fetch";

export default {
    name: "neko",
    alias: ["nekopic"],
    desc: "Get a random anime neko image",
    category: "Anime",
    usage: ".neko",

    async execute(sock, m) {
        try {
            const jid = m.key.remoteJid;

            // Fetch neko image
            const res = await fetch("https://api.waifu.pics/sfw/neko");
            const data = await res.json();

            if (!data || !data.url) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ Failed to fetch neko image." },
                    { quoted: m }
                );
            }

            // Send image
            await sock.sendMessage(
                jid,
                {
                    image: { url: data.url },
                    caption: "🐺 *WolfBot Neko* 🐺\nHere’s a cute neko for you 😺✨"
                },
                { quoted: m }
            );

        } catch (error) {
            console.error("Neko command error:", error);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ An error occurred while fetching neko." },
                { quoted: m }
            );
        }
    }
};
