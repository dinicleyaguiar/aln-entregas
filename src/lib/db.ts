import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { hashPassword, verifyPassword } from "@/lib/security";

const globalForDb = globalThis as unknown as { alnDb?: DatabaseSync };

function resolveDbPath() {
  const configured = (process.env.DB_PATH || "aln-entregas.db").trim();
  const fileName = path.basename(configured);

  if (!/^[a-zA-Z0-9._-]+\.db$/i.test(fileName)) {
    throw new Error(
      "DB_PATH deve apontar para um arquivo .db com nome válido dentro da pasta data.",
    );
  }

  return path.join(process.cwd(), "data", fileName);
}

function initialize(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS package_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      arrival_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      morning_open TEXT NOT NULL DEFAULT '09:00',
      morning_close TEXT NOT NULL DEFAULT '12:00',
      afternoon_open TEXT NOT NULL DEFAULT '14:00',
      afternoon_close TEXT NOT NULL DEFAULT '18:00',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'ATIVA',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'AGUARDANDO',
      received_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES package_lists(id) ON DELETE CASCADE,
      UNIQUE (list_id, normalized_name)
    );

    CREATE INDEX IF NOT EXISTS idx_recipients_normalized_name
      ON recipients(normalized_name);

    CREATE INDEX IF NOT EXISTS idx_recipients_list
      ON recipients(list_id);

    CREATE INDEX IF NOT EXISTS idx_lists_return_date
      ON package_lists(return_date);
  `);

  const name = process.env.ADMIN_NAME || "Administrador ALN";
  const email = (process.env.ADMIN_EMAIL || "admin@alnentregas.local")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "aln123456";

  const configuredAdmin = db
    .prepare("SELECT id, password_hash FROM admins WHERE email = ?")
    .get(email) as { id: number; password_hash: string } | undefined;

  if (!configuredAdmin) {
    db.prepare(
      "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
    ).run(name, email, hashPassword(password));
  } else if (!verifyPassword(password, configuredAdmin.password_hash)) {
    db.prepare(
      "UPDATE admins SET name = ?, password_hash = ? WHERE id = ?",
    ).run(name, hashPassword(password), configuredAdmin.id);
  }
}

export function getDb() {
  if (!globalForDb.alnDb) {
    const dbPath = resolveDbPath();
    mkdirSync(path.dirname(dbPath), { recursive: true });

    const db = new DatabaseSync(dbPath, {
      timeout: 5000,
    });

    initialize(db);
    globalForDb.alnDb = db;
  }

  return globalForDb.alnDb;
}
