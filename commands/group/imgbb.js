



import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
  name: "imgbb",
  description: "Convert replied image to ImgBB URL directly",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      // Check if message is a reply to an image
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) {
        return sock.sendMessage(
          jid,
          {
            text: `📸 *ImgBB URL Generator*\n\nReply to an image with *${global.prefix}imgbb* to get a direct URL.`
          },
          { quoted: m }
        );
      }

      // Load API key
      const apiKey = process.env.IMGBB_API_KEY || global.IMGBB_API_KEY;
      if (!apiKey) {
        return sock.sendMessage(
          jid,
          {
            text: `❌ *ImgBB API Key Missing*\nAdd this in your .env:\n\nIMGBB_API_KEY=YOUR_KEY_HERE`
          },
          { quoted: m }
        );
      }

      // Acknowledgement message
      const processingMsg = await sock.sendMessage(
        jid,
        { text: "⏳ *Downloading image from WhatsApp...*" },
        { quoted: m }
      );

      // ⭐ FIXED: Use Baileys decryption, NOT axios
      let imageBuffer;
      try {
        console.log("📥 Downloading via Baileys decryption...");

        imageBuffer = await downloadMediaMessage(
          { message: quoted },
          "buffer",
          {}
        );

        if (!imageBuffer || imageBuffer.length < 150) {
          throw new Error("Image buffer is empty or corrupted");
        }

      } catch (err) {
        console.log("❌ Download Error:", err.message);
        return sock.sendMessage(
          jid,
          { text: "❌ *Failed to download image from WhatsApp (decryption failed)*" },
          { quoted: m }
        );
      }

      // Update status
      await sock.sendMessage(
        jid,
        {
          text: `📤 *Uploading ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB to ImgBB...*`,
          edit: processingMsg.key
        }
      );

      // Upload
      const result = await uploadToImgBB(imageBuffer, apiKey);

      if (!result.success) {
        return sock.sendMessage(
          jid,
          {
            text: `❌ *ImgBB Upload Failed*\n\n${result.error}`,
            edit: processingMsg.key
          }
        );
      }

      // Success
      return sock.sendMessage(
        jid,
        {
          text:
            `✅ *ImgBB Upload Successful!*\n\n` +
            `🌐 *Direct URL:*\n${result.url}\n\n` +
            `🆔 *Image ID:* ${result.id}\n` +
            `🗑 *Delete URL:* ${result.deleteUrl}\n\n` +
            ``,
          edit: processingMsg.key
        }
      );

    } catch (err) {
      console.error("❌ [IMGBB ERROR]:", err.message);
      return sock.sendMessage(
        jid,
        { text: `❌ Unexpected error: ${err.message}` },
        { quoted: m }
      );
    }
  }
};

// ⭐ FIXED ImgBB uploader (base64)
async function uploadToImgBB(buffer, apiKey) {
  try {
    const base64 = buffer.toString("base64");

    const params = new URLSearchParams();
    params.append("key", apiKey);
    params.append("image", base64);

    const res = await axios.post(
      "https://api.imgbb.com/1/upload",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000
      }
    );

    if (res.data.success) {
      return {
        success: true,
        url: res.data.data.url,
        id: res.data.data.id,
        deleteUrl: res.data.data.delete_url
      };
    }

    return {
      success: false,
      error: res.data.error?.message || "Unknown ImgBB error"
    };

  } catch (e) {
    console.log("❌ ImgBB Error:", e.response?.data || e.message);

    const code = e.response?.data?.error?.code;
    let msg = "Upload failed";

    if (code === 310) msg = "Invalid image source / corrupted data";
    if (code === 100) msg = "No image data received";
    if (code === 110) msg = "Invalid image format";
    if (code === 120) msg = "Image too large";
    if (code === 130) msg = "Upload timeout";

    return { success: false, error: msg };
  }
}
