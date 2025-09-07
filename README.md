# Pingachu

A minimal Telegram bot for managing roles in group chats, running on Cloudflare Workers and D1.

## Features

- Create, delete, and list roles
- Assign/unassign users to roles
- List users in a role
- Mention all users in a role
- `/help` command for usage info
- Fast, serverless, and easy to deploy

## Commands

```
/createrole <name>           - Create a new role
/deleterole <role_name>      - Delete a role
/listroles                   - List all roles
/assign <role_name> <@user>  - Assign a role to a user
/unassign <role_name> <@user>- Remove a user from a role
/roleusers <role_name>       - List users in a role
/ping <role_name>            - Mention all users in a role
/help                        - Show help message
```

## Setup

1. **Clone the repo and install dependencies:**

   ```sh
   git clone <repo-url>
   cd <repo-folder>
   npm install
   ```

2. **Set your Telegram bot token as a secret:**

   ```sh
   npx wrangler secret put PINGACHU_BOT_TOKEN
   ```

3. **Deploy to Cloudflare Workers:**

   ```sh
   npm run deploy
   ```

4. **Set your Telegram webhook:**
   ```sh
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -d "url=https://<your-worker>.workers.dev/webhook"
   ```

## Notes

- The bot supports commands with or without the `@botusername` suffix (e.g., `/start@yourbot`).
- Requires Cloudflare D1 for persistent role storage.
- All logic is in ES module format and split for maintainability.

## License

MIT
