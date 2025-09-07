CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    chat_id INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS role_assignments (
    role_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    UNIQUE(role_id, username),
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);