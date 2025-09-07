import { DB } from "../db/d1";

export async function handleTelegramCommand(
  command: string,
  args: string[],
  chatId: number,
  db: DB,
  reply: (msg: string) => Promise<void>,
) {
  switch (command) {
    case "/start":
      await reply(
        "Hello! This is a minimal Telegram bot running on Cloudflare Workers.",
      );
      break;
    case "/createrole": {
      if (args.length < 1) return await reply("Usage: /createrole <name>");
      const name = args[0];
      try {
        const role = await db.createRole(name, chatId);
        await reply("Role created: " + role.name);
      } catch (err: any) {
        await reply("Failed to create role: " + err.message);
      }
      break;
    }
    case "/deleterole": {
      if (args.length < 1) return await reply("Usage: /deleterole <role_name>");
      const roleName = args[0];
      try {
        await db.deleteRole(roleName, chatId);
        await reply("Role deleted: " + roleName);
      } catch (err: any) {
        await reply("Failed to delete role: " + err.message);
      }
      break;
    }
    case "/listroles": {
      try {
        const roles = await db.listRoles(chatId);
        if (!roles.length) return await reply("No roles found.");
        const msg = roles.map((r: any) => r.name).join("\n");
        await reply("Roles:\n" + msg);
      } catch (err: any) {
        await reply("Failed to list roles: " + err.message);
      }
      break;
    }
    case "/assign": {
      if (args.length < 2)
        return await reply("Usage: /assign <role_name> <@username>");
      let [roleName, username] = args;
      if (!username)
        return await reply("Please provide a username as @username.");
      if (username[0] === "@") username = username.slice(1);
      username = username.toLowerCase();
      try {
        const role = await db.getRole(roleName, chatId);
        if (!role) return await reply("Role not found: " + roleName);
        const existingUsernames = await db.getRoleMemberUsernames(role.id);
        if (existingUsernames.includes(username)) {
          return await reply(
            "User @" + username + " is already in role " + roleName,
          );
        }
        await db.addRoleToUserByUsername(role.id, username);
        await reply("User @" + username + " added to role " + roleName);
      } catch (err: any) {
        await reply("Failed to add user to role: " + err.message);
      }
      break;
    }
    case "/unassign": {
      if (args.length < 2)
        return await reply("Usage: /unassign <role_name> <@username>");
      let [roleName, username] = args;
      if (!username)
        return await reply("Please provide a username as @username.");
      if (username[0] === "@") username = username.slice(1);
      username = username.toLowerCase();
      try {
        const role = await db.getRole(roleName, chatId);
        if (!role) return await reply("Role not found: " + roleName);
        await db.removeRoleFromUserByUsername(role.id, username);
        await reply("User @" + username + " removed from role " + roleName);
      } catch (err: any) {
        await reply("Failed to remove user from role: " + err.message);
      }
      break;
    }
    case "/roleusers": {
      if (args.length < 1) return await reply("Usage: /roleusers <role_name>");
      const roleName = args[0];
      try {
        const role = await db.getRole(roleName, chatId);
        if (!role) return await reply("Role not found: " + roleName);
        const usernames = await db.getRoleMemberUsernames(role.id);
        if (!usernames.length)
          return await reply("No users in role " + roleName);
        const msg = usernames.map((u: string) => "@" + u).join("\n");
        await reply("Users in role " + roleName + ":\n" + msg);
      } catch (err: any) {
        await reply("Failed to get role members: " + err.message);
      }
      break;
    }
    case "/ping": {
      if (args.length < 1) return await reply("Usage: /ping <role_name>");
      const roleName = args[0];
      try {
        const role = await db.getRole(roleName, chatId);
        if (!role) return await reply("Role not found: " + roleName);
        const usernames = await db.getRoleMemberUsernames(role.id);
        if (!usernames.length)
          return await reply("No users in role " + roleName);
        const mentions = usernames.map((u: string) => "@" + u).join(" ");
        await reply(mentions);
      } catch (err: any) {
        await reply("Failed to get role members: " + err.message);
      }
      break;
    }
    case "/help": {
      const helpMsg = `Available commands:\n/createrole <name> - Create a new role\n/deleterole <role_name> - Delete a role\n/listroles - List all roles\n/assign <role_name> <@username> - Assign a role to a user\n/unassign <role_name> <@username> - Remove a role from a user\n/roleusers <role_name> - List users in a role\n/ping <role_name> - Mention all users in a role\n/help - Show this help message`;
      await reply(helpMsg);
      break;
    }
    default:
      // Optionally handle unknown commands
      break;
  }
}
