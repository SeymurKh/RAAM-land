<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:raam-infra -->
# Инфраструктура и деплой (продакшн)

**Прод:** https://raam-label.com — Hetzner Cloud CX23 (2 vCPU / 4 GB), Нюрнберг, Ubuntu.
Полный гайд по серверу: `DEPLOY.md`.

## Стек
- **Docker + docker compose** на сервере: сервис `app` (Next.js standalone, `node server.js`, :3000) + `caddy` (авто-SSL Let's Encrypt, :80/:443, HTTP/3)
- **CDN/DNS:** Cloudflare (proxy on, SSL Full strict); регистратор Namecheap (NS → Cloudflare)
- **CI/CD:** пуш в `master` → GitHub Actions (`.github/workflows/deploy.yml`) → сборка образа → GHCR (`ghcr.io/seymurkh/raam-land`, публичный) → SSH на сервер → `git pull && docker compose pull && up -d`. Секреты CI: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`

## Сервер
- IP: `2.28.49.132`. SSH: `ssh deploy@2.28.49.132` (только ключи; пароль отключён; root-пароль у мейнтейнера в менеджере паролей)
- Код: `/opt/raam` (git clone репо). Секреты: `/opt/raam/.env.production` (ADMIN_PASSWORD, JWT_SECRET, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, SMTP_USER, SMTP_PASS, MAIL_TO — шаблон в `.env.production.example`)

## Данные — НЕ в git
- Контент (артисты/проекты/стрим) живёт в **named volumes**: `raam-data` → `/app/data/db.json`, `raam-uploads` → `/app/public/uploads/`
- `data/db.json` в репо — только сид для первого запуска; на проде volume — источник истины. **Правки контента — только через админку** (`/admin`), не через репозиторий
- Бэкапы: Hetzner Backups включены (ежедневные снапшоты диска)

## Ключевые нюансы кода (не сломай!)
- **Runtime-загрузки**: Next.js prod отдаёт из `public/` только файлы на момент сборки → новые файлы отдаёт dynamic-роут `app/uploads/[...path]/route.ts`
- **`?v=` cache-buster**: клиенты добавляют к URL фото `?v=<ts>`; перед любыми fs-операциям и записью в БД путь чистится через `cleanUploadUrl()` (`lib/uploads.ts`)
- **SMTP**: Gmail через порт **587 (STARTTLS)** — 465 у Hetzner заблокирован для новых аккаунтов. Форма заявок: `app/api/inquiry/route.ts` (honeypot + rate limit)

## Полезные команды (на сервере, из `/opt/raam`)
`docker compose logs -f app` · `docker compose restart app` · `docker compose pull && docker compose up -d` (ручной деплой) · `docker compose ps`
<!-- END:raam-infra -->
