import { handleTelegramCommand } from "./bot/commands";
import { DB } from "./db/d1";
const WEBHOOK = "/webhook";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const TOKEN = env.PINGACHU_BOT_TOKEN;
    const D1DB = env.pingachu;

    if (url.pathname === WEBHOOK) {
      const update = await request.json();
      ctx.waitUntil(onUpdate(update, TOKEN, D1DB));
      return new Response("Ok");
    }
    return new Response("No handler for this request");
  },
};

async function onUpdate(update: any, TOKEN: string, D1DB: D1Database) {
  if ("message" in update) {
    await onMessage(update.message, TOKEN, D1DB);
  }
}

async function onMessage(message: any, TOKEN: string, D1DB: D1Database) {
  const chatId = message.chat.id;
  const text = message.text || "";
  const args = text.split(" ");
  let command = args[0];
  // Accept /command@botusername
  command = command.replace(/@\w+$/, "");
  args.shift();

  async function reply(msg: string) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: msg }),
    });
  }

  const db = new DB(D1DB);
  await handleTelegramCommand(command, args, chatId, db, reply);
}
