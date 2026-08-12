# Деплой RAAM на Hetzner

Продакшн-гайд: от чистого VPS до работающего `https://raam-label.com` с автодеплоем.

## Архитектура

```
GitHub push → GitHub Actions: сборка Docker-образа → GHCR → SSH → docker compose up -d
Интернет → Cloudflare (CDN, DNS) → Caddy (авто-SSL, HTTP/3) → Next.js standalone :3000
                                                              ├─ volume raam-data     (/app/data)
                                                              └─ volume raam-uploads  (/app/public/uploads)
```

## Что понадобится

- IP сервера и root-пароль (письмо от Hetzner)
- Доступ к Namecheap (домен) и GitHub (репозиторий)
- Аккаунт Cloudflare (бесплатный)
- Gmail App Password для `roomallaboutmusic@gmail.com` (шаг 4)

---

## Шаг 1. Первичная настройка сервера

Зайди по SSH под root (пароль из письма Hetzner):

```bash
ssh root@<IP_СЕРВЕРА>
```

### 1.1 Пользователь deploy

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
```

### 1.2 SSH-ключ для пользователя deploy

На **своём компьютере** (Windows, PowerShell), если ключа ещё нет:

```powershell
ssh-keygen -t ed25519
```

Скопируй публичный ключ на сервер:

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@<IP_СЕРВЕРА> "mkdir -p /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys"
```

Проверь вход: `ssh deploy@<IP_СЕРВЕРА>` — должно пускать без пароля.

### 1.3 Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```

### 1.4 Firewall (UFW)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable
```

### 1.5 fail2ban (защита SSH от брутфорса)

```bash
apt update && apt install -y fail2ban
systemctl enable --now fail2ban
```

---

## Шаг 2. Код на сервере

### 2.1 Deploy key для приватного репозитория

На сервере под `deploy` (`ssh deploy@<IP>` или `su - deploy`):

```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub
```

Вывод добавь в GitHub: **репозиторий → Settings → Deploy keys → Add deploy key** (read-only достаточно).

```bash
echo 'Host github.com\n  IdentityFile ~/.ssh/github_deploy\n  IdentitiesOnly yes' >> ~/.ssh/config
```

### 2.2 Клонирование

```bash
sudo mkdir -p /opt/raam && sudo chown deploy:deploy /opt/raam
git clone git@github.com:SeymurKh/RAAM-land.git /opt/raam
cd /opt/raam
```

---

## Шаг 3. Переменные окружения

```bash
cp .env.production.example .env.production
nano .env.production
```

Заполни:

| Переменная | Где взять |
|---|---|
| `ADMIN_PASSWORD` | Придумай надёжный пароль для `/admin` |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `YOUTUBE_API_KEY` | Из текущего Vercel-проекта (или Google Cloud Console) |
| `YOUTUBE_CHANNEL_ID` | Оттуда же |
| `SMTP_USER` | `roomallaboutmusic@gmail.com` |
| `SMTP_PASS` | App Password, см. шаг 4 |
| `MAIL_TO` | `roomallaboutmusic@gmail.com` |

Права: `chmod 600 .env.production`

---

## Шаг 4. Gmail App Password (для формы заявок)

1. Зайди в аккаунт `roomallaboutmusic@gmail.com`
2. **myaccount.google.com → Security → 2-Step Verification** — включи, если выключена
3. Там же: **App passwords** (или поиск «App passwords» вверху страницы)
4. Создай пароль для приложения «Mail» → получишь 16 символов вида `abcd efgh ijkl mnop`
5. Впиши в `.env.production` как `SMTP_PASS` (пробелы можно оставить или убрать — без разницы)

Проверка позже: заявки с сайта будут падать на этот же ящик, ответ клиенту — обычным «Reply».

---

## Шаг 5. Доступ сервера к GHCR (реестр образов)

Образы собираются в GitHub Actions и хранятся в `ghcr.io/seymurkh/raam-land`.

**Вариант А (если репозиторий публичный):** после первого пуша открой
**GitHub → Packages → raam-land → Package settings → Change visibility → Public**.
Тогда серверу авторизация не нужна вообще.

**Вариант Б (приватный репозиторий):** создай Personal Access Token:
**GitHub → Settings → Developer settings → Personal access tokens (classic) → Generate**,
права: `read:packages`. На сервере один раз:

```bash
echo "<PAT>" | docker login ghcr.io -u SeymurKh --password-stdin
```

---

## Шаг 6. DNS: Cloudflare + Namecheap

1. **cloudflare.com** → Add site → `raam-label.com` → Free plan
2. Cloudflare покажет два nameserver'а (например `abby.ns.cloudflare.com`)
3. **Namecheap → Domain List → Manage → Nameservers → Custom DNS** → впиши оба, сохрани
4. Подожди активацию (обычно 5–30 минут, Cloudflare пришлёт письмо)
5. В Cloudflare → **DNS → Records**:
   - `A` · имя `@` · IPv4 = `<IP_СЕРВЕРА>` · **Proxied** (оранжевое облако)
   - `A` · имя `www` · IPv4 = `<IP_СЕРВЕРА>` · **Proxied**
6. **SSL/TLS → Overview** → режим **Full (strict)**

Caddy сам выпустит Let's Encrypt сертификат через Cloudflare (ACME-челлендж проходит сквозь прокси автоматически).

---

## Шаг 7. GitHub Secrets для автодеплоя

Создай **отдельный** ключ для CI на своём компьютере:

```powershell
ssh-keygen -t ed25519 -N '""' -f $env:USERPROFILE\.ssh\raam_deploy_ci
```

Публичную часть добавь на сервер:

```powershell
type $env:USERPROFILE\.ssh\raam_deploy_ci.pub | ssh deploy@<IP_СЕРВЕРА> "cat >> ~/.ssh/authorized_keys"
```

В репозитории: **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Значение |
|---|---|
| `SERVER_HOST` | `<IP_СЕРВЕРА>` |
| `SERVER_USER` | `deploy` |
| `SERVER_SSH_KEY` | Содержимое **приватного** ключа `raam_deploy_ci` (файл без `.pub`) |

---

## Шаг 8. Первый запуск

Запушь код в `master` — GitHub Actions соберёт образ и задеплоит. Либо вручную на сервере:

```bash
cd /opt/raam
docker compose pull   # или: docker compose build
docker compose up -d
docker compose logs -f
```

Проверка:

```bash
curl -I https://raam-label.com          # 200, server: Caddy
docker compose ps                        # оба контейнера Up
```

Затем в браузере: сайт, `/admin` (логин паролем из `ADMIN_PASSWORD`), тестовая заявка через форму → письмо на Gmail.

---

## Автодеплой

Каждый `git push` в `master`:

1. **build**: GitHub собирает Docker-образ → пушит в GHCR (`:latest` + `:<sha>`)
2. **deploy**: по SSH на сервере: `git pull` → `docker compose pull` → `up -d`

Сервер сборку не выполняет — обновление занимает ~30 секунд, нагрузки нет.
Ручной запуск: **Actions → Deploy → Run workflow**.

## Бэкапы

1. **Hetzner Backups** (в панели сервера, +20% к цене) — снапшот всего диска ежедневно. Рекомендую включить.
2. Плюс архив данных (БД + фото) по cron, раз в неделю:

```bash
mkdir -p /home/deploy/backups
crontab -e
# добавить строку:
# 0 4 * * 0 docker run --rm -v raam_raam-data:/d:ro -v raam_raam-uploads:/u:ro -v /home/deploy/backups:/b alpine tar czf /b/raam-$(date +\%F).tar.gz -C / d u
```

## Полезные команды

```bash
docker compose logs -f app       # логи сайта
docker compose logs -f caddy     # логи прокси/SSL
docker compose restart app       # перезапуск приложения
docker compose pull && docker compose up -d   # ручной деплой
docker system df                 # место на диске
```

## Заметки

- `data/db.json` и `public/uploads` живут в **named volumes** — пересоздание контейнеров их не затирает. При первом запуске volume инициализируется данными из образа (сид из репозитория).
- Если меняешь `Caddyfile`: `docker compose restart caddy`.
- Vercel-проект можно оставить как staging — на прод это не влияет.
