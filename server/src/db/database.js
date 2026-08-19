import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "../config.js";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      avatar TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      age INTEGER NOT NULL CHECK(age BETWEEN 18 AND 90),
      nationality TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hobbies (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS user_hobbies (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      hobby_id INTEGER NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, hobby_id)
    );
    CREATE INDEX IF NOT EXISTS idx_users_names ON users(first_name, last_name);
    CREATE INDEX IF NOT EXISTS idx_users_nationality ON users(nationality);
    CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
    CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby ON user_hobbies(hobby_id, user_id);
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
  `);
}
