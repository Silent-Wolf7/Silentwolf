import fetch from "node-fetch";

export default {
    name: "megumin",
    alias: ["explosion"],
    desc: "Get a random Megumin anime image",
    category: "Anime",
    usage: ".megumin",

    async execute(sock, m) {
        try {
            const jid = m.key.remoteJid;

            // Fetch Megumin image
            const res = await fetch("https://api.waifu.pics/sfw/megumin");
            const data = await res.json();

            if (!data || !data.url) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ Failed to fetch Megumin image." },
                    { quoted: m }
                );
            }

            // Send image
            await sock.sendMessage(
                jid,
                {
                    image: { url: data.url },
                    caption: "💥 *MEGUMIN* 💥\nExplosion magic activated! 🔥🐺"
                },
                { quoted: m }
            );

        } catch (error) {
            console.error("Megumin command error:", error);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ An error occurred while fetching Megumin." },
                { quoted: m }
            );
        }
    }
};
