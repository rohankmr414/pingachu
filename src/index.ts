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

    if (url.pathname === WEBHOOK) {
      const update = await request.json();
      ctx.waitUntil(onUpdate(update, TOKEN, env));
      return new Response("Ok");
    }
    return new Response("No handler for this request");
  },
};

async function onUpdate(update: any, TOKEN: string, env: Env) {
  if ("message" in update) {
    await onMessage(update.message, TOKEN, env);
  }
}

async function onMessage(message: any, TOKEN: string, env: Env) {
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

  if (!env?.pingachu) {
    await reply("Database not configured.");
    return;
  }
  const db = new DB(env.pingachu);
  await handleTelegramCommand(command, args, chatId, db, reply);
}
