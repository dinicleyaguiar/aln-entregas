import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const dbPath = resolve(process.cwd(), process.env.DB_PATH || "data/aln-entregas.db");
for (const path of [dbPath, `${dbPath}-shm`, `${dbPath}-wal`]) {
  if (existsSync(path)) rmSync(path, { force: true });
}
console.log("Banco local removido. Ele será recriado no próximo acesso.");
