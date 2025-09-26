# Pingachu

A minimal Telegram bot for managing roles in group chats, running on Cloudflare Workers and D1.

## Features

 - Create, delete, rename, and list roles
 - Assign or unassign roles for users (supports multiple users per command)
 - View users assigned to a role
 - Notify all users assigned to a role
 - `/help` command for usage instructions
 - Fast, serverless, and easy to deploy

## Commands

```
/createrole <name>                         - Create a new role
/deleterole <role_name>                    - Delete a role
/renamerole <old_name> <new_name>          - Rename a role
/listroles                                 - List all roles available in a chat
/assign <role_name> <@user> [@user ...]    - Assign a role to one or more users
/unassign <role_name> <@user> [@user ...]  - Unassign a role from one or more users
/roleusers <role_name>                     - View users assigned to a role
/ping <role_name>                          - Notify all users assigned to a role
/help                                      - Show usage instructions
```

## Setup

1. **Clone the repo and install dependencies:**

   ```sh
   git clone <repo-url>
   cd <repo-folder>
   npm install
   ```

2. **Add your secrets to Cloudflare Workers:**

   ```sh
   npx wrangler secret put PINGACHU_BOT_TOKEN         # Telegram bot token
   npx wrangler secret put TELEGRAM_WEBHOOK_SECRET    # Secret for verifying Telegram webhooks
   ```

3. **Deploy to Cloudflare Workers:**

   ```sh
   npm run deploy
   ```

4. **Set your Telegram webhook:**
   ```sh
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -d "url=https://<your-worker>.workers.dev/webhook" \
     -d "secret_token=<YOUR_SECRET_TOKEN>"
   ```

## Notes

- The bot supports commands with or without the `@botusername` suffix (e.g., `/start@yourbot`).
- Requires Cloudflare D1 for persistent role storage.
- All logic is in ES module format and split for maintainability.

## License

MIT
