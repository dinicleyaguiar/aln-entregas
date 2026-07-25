[CmdletBinding()]
param(
    [ValidateSet("development", "production")]
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

if ($Environment -eq "production") {
    docker compose -f compose.prod.yaml exec -T app node scripts/backup-db.mjs
} else {
    docker compose exec -T app node scripts/backup-db.mjs
}

if ($LASTEXITCODE -ne 0) {
    throw "O backup do banco não foi concluído."
}
