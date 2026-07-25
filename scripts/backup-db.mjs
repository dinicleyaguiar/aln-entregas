import { backup, DatabaseSync } from "node:sqlite";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";

function timestamp() {
  return new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replace(/\.\d{3}Z$/, "Z");
}

const projectRoot = process.cwd();
const configuredDbPath = process.env.DB_PATH || "data/aln-entregas.db";
const sourcePath = path.isAbsolute(configuredDbPath)
  ? configuredDbPath
  : path.resolve(projectRoot, configuredDbPath);

const backupDirectory = path.resolve(
  projectRoot,
  process.env.BACKUP_DIR || "backups",
);

const destinationPath = path.join(
  backupDirectory,
  `aln-entregas-${timestamp()}.db`,
);

try {
  await access(sourcePath);
  await mkdir(backupDirectory, { recursive: true });

  const sourceDb = new DatabaseSync(sourcePath, {
    readOnly: true,
    timeout: 5000,
  });

  try {
    const pages = await backup(sourceDb, destinationPath, {
      rate: 100,
    });

    console.log(`Backup criado: ${destinationPath}`);
    console.log(`Páginas copiadas: ${pages}`);
  } finally {
    sourceDb.close();
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Falha desconhecida no backup.",
  );
  process.exitCode = 1;
}
