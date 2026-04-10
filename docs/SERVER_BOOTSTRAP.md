# Server bootstrap

How to take a fresh Ubuntu server from nothing to a working `freezino.online` deploy. Every command was run verbatim during the real cutover (DO-011) on 2026-04-09, so if something doesn't work exactly as written, the doc is wrong, not you.

> **Shared-server note.** `freezino.online` lives on a server that also hosts `lags-and-mislocations`, `mangaoff`, `palevo`, and a handful of other projects, all fronted by one system-level nginx that terminates TLS via letsencrypt. If you're deploying to that specific box, skip steps 1–3 (docker, nginx, certbot already exist) and be extra careful in step 6 (don't overwrite other sites in `/etc/nginx/sites-enabled/`). If you're on a fresh VPS, follow the doc top-to-bottom.

---

## 0. Prerequisites

- Ubuntu 24.04 or 25.04, x86_64
- Minimum 2 GB RAM, 10 GB disk free
- A domain (`freezino.online`) with an `A`/`AAAA` record pointing at the server
- Root SSH access
- A GitHub account with `admin` on `no-money-freezion/freezino_python_api`

---

## 1. Install system packages

```bash
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl openssl
systemctl enable --now docker
```

Verify:

```bash
docker version                 # Server: 28.x
docker-compose --version       # 1.29.x (ok — deploy.sh fallback handles both v1 and v2)
nginx -v
certbot --version
```

> **Why `docker-compose` v1 instead of the v2 plugin?** On Ubuntu's `docker.io` package the `docker-compose-plugin` isn't in apt, and the official Docker repo would shadow the Ubuntu-shipped binary. v1 is deprecated but stable enough for our dev-scale project, and `deploy.sh` has a fallback that picks whichever is available.

---

## 2. Clone the repo

```bash
mkdir -p /opt/freezino_python_api
cd /opt/freezino_python_api
git clone https://github.com/no-money-freezion/freezino_python_api.git .
```

---

## 3. Create `.env` with a real `SECRET_KEY`

```bash
cp .env.example .env
sed -i "s|SECRET_KEY=.*|SECRET_KEY=$(openssl rand -hex 32)|" .env
chmod 600 .env
```

Double-check the file is not world-readable:

```bash
ls -la .env   # -rw------- (600)
```

> `main.py` currently ignores `SECRET_KEY` and hardcodes its own — tracked in **BE-006**. The placeholder in `.env` is still worth having now so the cutover is zero-config the moment BE-006 merges. See also **DO-016**.

---

## 4. First deploy

```bash
./deploy.sh prod
```

This pulls images, builds backend + frontend, starts both containers, waits for healthchecks, and prints a status summary.

Verify from the host:

```bash
curl http://127.0.0.1:3000/api/health   # {"status":"IT'S ALIVE",...}
curl -I http://127.0.0.1:3001/          # HTTP/1.1 200 OK (nginx:alpine)
```

If anything fails, check:

```bash
./deploy.sh logs                # follow logs from all services
docker ps                       # containers running? healthy?
docker inspect freezino-backend-prod --format '{{json .State.Health}}' | jq .
```

---

## 5. System nginx config

Install the reference config from the repo into `sites-available`:

```bash
cp scripts/nginx-freezino.conf /etc/nginx/sites-available/freezino
```

Enable the site (skip this line if you're re-using an existing symlink):

```bash
ln -sf /etc/nginx/sites-available/freezino /etc/nginx/sites-enabled/freezino
```

**Never `rm` or overwrite other files in `/etc/nginx/sites-enabled/`** — those are other projects' configs. Just leave them alone.

Test and reload:

```bash
nginx -t && systemctl reload nginx
```

`nginx -t` must say both `syntax is ok` and `test is successful` before you reload. If it errors, fix the config first — don't reload a broken config.

---

## 6. TLS via certbot

Only if the cert isn't already issued (you can check with `ls /etc/letsencrypt/live/freezino.online/`):

```bash
certbot --nginx -d freezino.online -d www.freezino.online
```

Certbot will edit the nginx config to add the `listen 443 ssl;` block and point at the letsencrypt cert paths. The reference config in `scripts/nginx-freezino.conf` already contains those lines, so certbot should be a no-op the second time around — but running it is idempotent and safe.

Auto-renewal is already installed by the certbot package via its own systemd timer:

```bash
systemctl list-timers | grep certbot
```

---

## 7. Verify end-to-end

From anywhere with curl:

```bash
curl https://freezino.online/api/health     # 200, {"status":"IT'S ALIVE",...}
curl -I https://freezino.online/            # 200, HTML
curl -I https://freezino.online/shop        # 200, SPA fallback serves index.html
```

From a browser: open `https://freezino.online/`, register a user, log in, navigate to `/dashboard` → work timer should mount. `/shop`, `/history`, `/games/*`, `/casino-stats`, `/credit` should show the "Coming soon" placeholder (those endpoints aren't implemented in the Python rewrite yet; see the FE-003 fallback in `frontend/src/App.tsx`).

---

## 8. Wire up GitHub Secrets for CD

The CD workflow (`.github/workflows/cd.yml`) runs on every push to `main`. It SSHes into the server and re-runs `./deploy.sh prod`. It needs four secrets to exist in the repo. Full procedure is in [`../.github/docs/secrets.md`](../.github/docs/secrets.md); the short version:

1. Generate a dedicated deploy key on your workstation (not on the server, not `~/.ssh/id_rsa`):

   ```bash
   ssh-keygen -t ed25519 -C "github-actions-freezino-deploy" -f ~/.ssh/freezino_deploy_key -N ""
   ssh-copy-id -i ~/.ssh/freezino_deploy_key.pub root@freezino.online
   ```

2. Push the secrets:

   ```bash
   REPO=no-money-freezion/freezino_python_api
   gh secret set SSH_HOST        --body "freezino.online" -R $REPO
   gh secret set SSH_USER        --body "root"            -R $REPO
   gh secret set SSH_PORT        --body "22"              -R $REPO
   gh secret set SSH_PRIVATE_KEY -R $REPO < ~/.ssh/freezino_deploy_key
   ```

3. Verify the names (values are write-only):

   ```bash
   gh secret list -R $REPO
   ```

4. Trigger the workflow manually for the first time:

   ```bash
   gh workflow run cd.yml -R $REPO
   gh run watch -R $REPO
   ```

   If it passes, every future merge to `main` auto-deploys.

---

## 9. Rollback procedure

If a deploy goes bad and you need to get back to a known-good state:

**A. Back to the previous commit on main:**

```bash
cd /opt/freezino_python_api
git log --oneline -5                      # find the last-good commit
git reset --hard <good-sha>
./deploy.sh prod
```

**B. Back to the old Go backend** (only useful shortly after the DO-011 cutover, while the Go unit file still exists):

```bash
# 1. Stop the Python containers
cd /opt/freezino_python_api
./deploy.sh stop

# 2. Restore the pre-cutover nginx config (backup was saved during DO-011)
cp /etc/nginx/sites-available/freezino.bak-goera-* /etc/nginx/sites-available/freezino
nginx -t && systemctl reload nginx

# 3. Start the Go systemd unit
systemctl start freezino-backend
curl http://127.0.0.1:3000/api/health
```

The Go binary + `/opt/freezino/` tree are still on the server for this reason. Don't `rm` them until you're confident the Python stack is stable long-term.

---

## 10. Daily SQLite backup cron (DO-012)

`scripts/backup-cron.sh` snapshots the live SQLite file out of the backend container into `./backups/` and keeps the last 14 days. It's written to be silent and harmless when called from cron (exits 0 and just logs a `SKIP` line if the container is mid-restart), so an active deploy won't spam you with error mail.

Test it once by hand:

```bash
cd /opt/freezino_python_api
./scripts/backup-cron.sh
ls -la backups/        # freezino-YYYYMMDD-HHMMSS.db + cron.log
tail -3 backups/cron.log
```

Install as a daily cron entry at 03:00 local time (the install line is idempotent — re-running it just re-writes the same entry):

```bash
(crontab -l 2>/dev/null | grep -v 'freezino_python_api.*backup-cron'; \
 echo "0 3 * * * cd /opt/freezino_python_api && ./scripts/backup-cron.sh") | crontab -
crontab -l
```

The snapshot directory and `cron.log` are intentionally **not** committed. Backups stay local to the server — there's no off-site copy (no S3, no rsync elsewhere). For a dev project with no real users that's fine; if that changes, extend the script to upload and add a `RESTIC_REPO` / `rclone` step.

---

## 11. Uptime monitoring (DO-013)

External `/api/health` polling runs from GitHub Actions — no extra service to pay for, no third-party signup. The workflow lives at `.github/workflows/uptime.yml` and ticks every 10 minutes. A failure (non-200 or body missing the `"IT'S ALIVE"` signature) fails the job, which triggers GitHub's default "workflow failed" email notification to the repo admin.

- **Manual run:** `gh workflow run uptime.yml -R no-money-freezion/freezino_python_api`
- **History:** repo Actions tab → "Uptime monitor"
- **Alerting:** the workflow itself doesn't file issues or call webhooks. If you need something louder than email (Slack, Telegram, PagerDuty), add an `if: failure()` step to the workflow that posts to whichever endpoint. The extension point is a single extra step, not a redesign.

GitHub Actions cron is best-effort — under heavy load GH may skip individual ticks. A 10-minute interval means the worst-case detection window for downtime is still under ~20 minutes, which is plenty for this project.

---

## 12. Optional hardening

None of this is required to get the site up. Do it when you care about stability.

- **Firewall:**
  ```bash
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```
- **fail2ban:** `apt install -y fail2ban` — default config bans SSH brute-force.
- **Log rotation:** `docker-compose.prod.yml` already caps per-container logs at 10 MB × 3 files via the `json-file` driver. System-level `logrotate` handles nginx access/error logs out of the box.
- **Certbot auto-renewal:** already active via systemd timer (see step 6).

---

## Quick reference

| Where | What |
|---|---|
| `/opt/freezino_python_api/` | Repo checkout + working tree |
| `/opt/freezino_python_api/.env` | Secrets (600, never committed) |
| `/opt/freezino_python_api/deploy.sh` | `dev | prod | stop | restart | logs | backup | clean` |
| `/opt/freezino_python_api/scripts/nginx-freezino.conf` | Reference system nginx config |
| `/etc/nginx/sites-available/freezino` | Live nginx config (copy of the above) |
| `/etc/letsencrypt/live/freezino.online/` | TLS certs (managed by certbot) |
| `freezino-backend-prod` (container) | FastAPI on `127.0.0.1:3000` |
| `freezino-frontend-prod` (container) | React SPA on `127.0.0.1:3001` |

---

## See also

- [`../.github/docs/secrets.md`](../.github/docs/secrets.md) — full deploy-key + GitHub Secrets walkthrough (DO-009)
- [`../scripts/nginx-freezino.conf`](../scripts/nginx-freezino.conf) — the reference host nginx config
- [`../deploy.sh`](../deploy.sh) — the deployment entrypoint
