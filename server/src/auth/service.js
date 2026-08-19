import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { db } from "../db/database.js";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export function authenticate(email, password) {
  const account = db
    .prepare("SELECT * FROM accounts WHERE email = ? COLLATE NOCASE")
    .get(email.trim());
  if (!account) return null;
  const [salt, storedHex] = account.password_hash.split(":");
  const stored = Buffer.from(storedHex, "hex");
  const candidate = scryptSync(password, salt, 64);
  if (stored.length !== candidate.length || !timingSafeEqual(stored, candidate))
    return null;
  return {
    id: account.id,
    email: account.email,
    displayName: account.display_name,
  };
}

export function createSession(accountId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_DURATION;
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  db.prepare(
    "INSERT INTO sessions(token_hash, account_id, expires_at) VALUES (?, ?, ?)",
  ).run(hashToken(token), accountId, expiresAt);
  return { token, expiresAt };
}

export function getSessionAccount(token) {
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT a.id, a.email, a.display_name AS displayName
    FROM sessions s JOIN accounts a ON a.id = s.account_id
    WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(hashToken(token), Date.now()) || null
  );
}

export function destroySession(token) {
  if (token)
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(
      hashToken(token),
    );
}
