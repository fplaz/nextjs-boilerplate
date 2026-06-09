const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = "-5259685174";

export async function sendTelegramMessage(text: string): Promise<void> {
  console.log("[Telegram] sendTelegramMessage called with text:", text);

  if (!TELEGRAM_BOT_TOKEN) {
    console.error("[Telegram] Aborting: TELEGRAM_BOT_TOKEN is not set");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    console.log("[Telegram] Sending request to Telegram API…");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    const body = await res.text();

    if (!res.ok) {
      console.error("[Telegram] sendMessage failed:", res.status, body);
    } else {
      console.log("[Telegram] sendMessage succeeded:", res.status, body);
    }
  } catch (err) {
    console.error("[Telegram] Fetch threw an error:", err);
  }
}
