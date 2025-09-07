export interface Role {
  id: number;
  name: string;
  chat_id: number;
}

export interface UserRole {
  id: number;
  username: string;
  role_id: number;
  chat_id: number;
}

export class DB {
  constructor(private DB: D1Database) {}

  async createRole(name: string, chatId: number): Promise<Role> {
    const result = await this.DB.prepare(
      "INSERT INTO roles (name, chat_id) VALUES (?, ?)",
    )
      .bind(name, chatId)
      .run();
    const id = (result.meta as any)?.last_row_id;
    return { id: Number(id), name, chat_id: chatId };
  }

  async getRole(name: string, chatId: number): Promise<Role | null> {
    const row = await this.DB.prepare(
      "SELECT id, name, chat_id FROM roles WHERE name = ? AND chat_id = ?",
    )
      .bind(name, chatId)
      .first<Record<string, unknown>>();
    if (!row) return null;
    return {
      id: Number(row.id),
      name: String(row.name),
      chat_id: Number(row.chat_id),
    };
  }

  async listRoles(chatId: number): Promise<Role[]> {
    const rows = await this.DB.prepare(
      "SELECT id, name, chat_id FROM roles WHERE chat_id = ?",
    )
      .bind(chatId)
      .all();
    return rows.results.map((row: any) => ({
      id: row.id,
      name: row.name,
      chat_id: row.chat_id,
    }));
  }

  async deleteRole(name: string, chatId: number): Promise<void> {
    await this.DB.prepare("DELETE FROM roles WHERE name = ? AND chat_id = ?")
      .bind(name, chatId)
      .run();
  }

  async addRoleToUserByUsername(
    roleId: number,
    username: string,
  ): Promise<void> {
    await this.DB.prepare(
      "INSERT INTO role_assignments (role_id, username) VALUES (?, ?)",
    )
      .bind(roleId, username)
      .run();
  }

  async removeRoleFromUserByUsername(
    roleId: number,
    username: string,
  ): Promise<void> {
    await this.DB.prepare(
      "DELETE FROM role_assignments WHERE role_id = ? AND username = ?",
    )
      .bind(roleId, username)
      .run();
  }

  async getRoleMemberUsernames(roleId: number): Promise<string[]> {
    const rows = await this.DB.prepare(
      "SELECT username FROM role_assignments WHERE role_id = ?",
    )
      .bind(roleId)
      .all();
    return rows.results.map((row: any) => row.username);
  }
}
