import { DB } from "../db/d1";

export async function handleTelegramCommand(
  command: string,
  args: string[],
  chatId: number,
  db: DB,
  reply: (msg: string) => Promise<void>,
) {
  switch (command) {
    case "/createrole": {
      if (args.length < 1) return await reply("Usage: /createrole <name>");
      const name = args[0];
      try {
        const role = await db.createRole(name, chatId);
        await reply("Role created: `" + role.name + "`");
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
        await reply("Role deleted: `" + roleName + "`");
      } catch (err: any) {
        await reply("Failed to delete role: " + err.message);
      }
      break;
    }
    case "/listroles": {
      try {
        const roles = await db.listRoles(chatId);
        if (!roles.length) return await reply("No roles found.");
        const msg = roles.map((r: any) => "`" + r.name + "`").join("\n");
        await reply("Roles available for this chat:\n" + msg);
      } catch (err: any) {
        await reply("Failed to list roles: " + err.message);
      }
      break;
    }
    case "/assign": {
      if (args.length < 2)
        return await reply("Usage: /assign <role_name> <@username> [@username...]");
      const roleName = args[0];
      let usernames = args
        .slice(1)
        .map((u) => (u.startsWith("@") ? u.slice(1) : u))
        .map((u) => u.toLowerCase());
      try {
        const role = await db.getRole(roleName, chatId);
        if (!role) return await reply("Role not found: " + roleName);
        const existingUsernames = await db.getRoleMemberUsernames(role.id);
        let added: string[] = [];
        let already: string[] = [];
        for (const username of usernames) {
        if (existingUsernames.includes(username)) {
            already.push(username);
          } else {
        await db.addRoleToUserByUsername(role.id, username);
            added.push(username);
          }
        }
        let msg = "";
        if (added.length)
          msg +=
            "Role `" + roleName + "` assigned to:\n" + added.map((u) => "`@" + u + "`").join("\n");
        if (already.length)
          msg += "\n\nAlready assigned:\n" + already.map((u) => "`@" + u + "`").join("\n");
        await reply(msg.trim() || "No users assigned.");
      } catch (err: any) {
        await reply("Failed to add user(s) to role: " + err.message);
      }
      break;
    }
    case "/unassign": {
      if (args.length < 2)
        return await reply("Usage: /unassign <role_name> <@username> [@username...]");
      const roleName = args[0];
      let usernames = args
        .slice(1)
        .map((u) => (u.startsWith("@") ? u.slice(1) : u))
        .map((u) => u.toLowerCase());
      try {
        const role = await db.getRole(roleName, chatId);
        if (!role) return await reply("Role not found: " + roleName);
        let removed: string[] = [];
        for (const username of usernames) {
        await db.removeRoleFromUserByUsername(role.id, username);
          removed.push(username);
        }
        let msg = "";
        if (removed.length)
          msg +=
            "Role `" +
            roleName +
            "` unassigned from:\n" +
            removed.map((u) => "`@" + u + "`").join("\n");
        await reply(msg.trim() || "No users unassigned.");
      } catch (err: any) {
        await reply("Failed to remove user(s) from role: " + err.message);
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
          return await reply(
            "No users have been assigned the role `" + roleName + "`.",
          );
        const msg = usernames.map((u: string) => "`@" + u + "`").join("\n");
        await reply(
          "Users who have been assigned the role `" + roleName + "`:\n" + msg,
        );
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
          return await reply(
            "No users have been assigned the role `" + roleName + "`.",
          );
        const mentions = usernames.map((u: string) => "@" + u).join(" ");
        await reply(
          "Notifying users assigned the role `" + roleName + "`:\n" + mentions,
        );
      } catch (err: any) {
        await reply("Failed to get role members: " + err.message);
      }
      break;
    }
    case "/help": {
      const helpMsg =
        "*Available Commands:*\n\n" +
        "`/createrole <name>` — Create a new role\n" +
        "`/deleterole <role_name>` — Delete a role\n" +
        "`/listroles` — List all roles available in this chat\n" +
        "`/assign <role_name> <@username> [@username ...]` — Assign a role to one or more users\n" +
        "`/unassign <role_name> <@username> [@username ...]` — Unassign a role from one or more users\n" +
        "`/roleusers <role_name>` — View users assigned to a role\n" +
        "`/ping <role_name>` — Notify all users assigned to a role\n" +
        "`/help` — Show usage instructions";
      await reply(helpMsg);
      break;
    }
    default:
      break;
  }
}
