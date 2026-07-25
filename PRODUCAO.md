# Ambiente de produção do ALN Entregas

## Criar o arquivo de ambiente

```powershell
Copy-Item .env.production.example .env.production
code .env.production
```

Troque obrigatoriamente `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` e `WHATSAPP_NUMBER`.

## Criar as pastas persistentes

```powershell
New-Item -ItemType Directory -Force .\data | Out-Null
New-Item -ItemType Directory -Force .\backups | Out-Null
```

## Testar o build

```powershell
docker compose -f compose.prod.yaml build --no-cache
```

## Iniciar

```powershell
docker compose down
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs -f app
```

## Fazer backup

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\backup-db.ps1 -Environment production
```

## Parar

```powershell
docker compose -f compose.prod.yaml down
```

## Atualizar

```powershell
git pull
docker compose -f compose.prod.yaml up -d --build
```
