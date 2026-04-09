# GitHub Secrets setup (DO-009)

The CD workflow (`.github/workflows/cd.yml`) needs 4 repository secrets to SSH into `freezino.online` and run `./deploy.sh prod`.

> ⚠️ **Never paste private keys into chat/issues/commits.** Set these via `gh secret set` or through the repo Settings UI.

## Required secrets

| Name | Value | How to get it |
|---|---|---|
| `SSH_HOST` | `freezino.online` | Domain pointing at the VPS. |
| `SSH_USER` | `root` (or whatever you deploy as) | Your SSH account on that VPS. |
| `SSH_PORT` | `22` | Override only if sshd runs on a non-default port. |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----` ... `-----END OPENSSH PRIVATE KEY-----` | Generate a **dedicated deploy key**, see below. |

## Generate a dedicated deploy key

**Do not reuse `~/.ssh/id_rsa` or any other personal key.** Cut a fresh key specifically for GitHub Actions so it can be rotated in isolation if it ever leaks.

On your machine (not the server):

```bash
# 1. Generate the keypair — no passphrase (Actions can't prompt).
ssh-keygen -t ed25519 -C "github-actions-freezino-deploy" -f ~/.ssh/freezino_deploy_key -N ""

# 2. Install the public key on the server.
ssh-copy-id -i ~/.ssh/freezino_deploy_key.pub root@freezino.online

# 3. Verify you can SSH with the new key.
ssh -i ~/.ssh/freezino_deploy_key root@freezino.online 'echo ok'
```

## Upload to GitHub

```bash
gh secret set SSH_HOST        --body "freezino.online"              --repo no-money-freezion/freezino_python_api
gh secret set SSH_USER        --body "root"                         --repo no-money-freezion/freezino_python_api
gh secret set SSH_PORT        --body "22"                           --repo no-money-freezion/freezino_python_api
gh secret set SSH_PRIVATE_KEY --repo no-money-freezion/freezino_python_api < ~/.ssh/freezino_deploy_key
```

Verify (names only — values are write-only by design):

```bash
gh secret list --repo no-money-freezion/freezino_python_api
```

## Optional: lock the deploy key to a single command

On the server, edit `~/.ssh/authorized_keys` and prefix the freezino deploy key line:

```
command="cd /opt/freezino_python_api && git fetch --all && git reset --hard origin/main && ./deploy.sh prod",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAAC3Nz... github-actions-freezino-deploy
```

With that prefix the key can *only* run the deploy script, nothing else. If the private key ever leaks from GitHub Secrets, the blast radius is limited to "an attacker can redeploy the current main branch". No shell, no file access, no lateral movement.

The CD workflow currently expects to run `./deploy.sh prod` under the default SSH shell, which means `appleboy/ssh-action` provides its own script. If you opt into the `command=...` lockdown above, the workflow doesn't need changes — the forced command replaces whatever `script:` block the action tries to send.

## Rotating the key

If the deploy key leaks or you just want periodic rotation:

```bash
# 1. Generate a new one.
ssh-keygen -t ed25519 -C "github-actions-freezino-deploy-$(date +%Y%m)" -f ~/.ssh/freezino_deploy_key_new -N ""

# 2. Swap the public key on the server — append the new one, remove the old one.
ssh root@freezino.online
nano ~/.ssh/authorized_keys  # add new, delete old
exit

# 3. Push the new private key to GitHub Secrets (overwrites).
gh secret set SSH_PRIVATE_KEY --repo no-money-freezion/freezino_python_api < ~/.ssh/freezino_deploy_key_new

# 4. Trigger a manual CD run to confirm — Actions → CD → "Run workflow".

# 5. Once green, shred the old private key locally.
shred -u ~/.ssh/freezino_deploy_key
mv ~/.ssh/freezino_deploy_key_new ~/.ssh/freezino_deploy_key
```

## First-time server bootstrap

Before the CD workflow can run, the server needs the repo checked out and a `.env` file at `/opt/freezino_python_api/.env`. This is a one-time manual step — see `SERVER_SETUP.md` (TODO: file under DO-010) for the full procedure, or the short version:

```bash
ssh root@freezino.online
mkdir -p /opt/freezino_python_api
cd /opt/freezino_python_api
git clone https://github.com/no-money-freezion/freezino_python_api.git .
cp .env.example .env
# Generate a real SECRET_KEY (backend doesn't read it yet — BE-006 — but .env should have it):
sed -i "s|SECRET_KEY=.*|SECRET_KEY=$(openssl rand -hex 32)|" .env
./deploy.sh prod
curl http://localhost:3000/api/health   # expect 200
```

After that first successful manual `./deploy.sh prod`, every subsequent merge to `main` will trigger the CD workflow which runs the same command over SSH.
