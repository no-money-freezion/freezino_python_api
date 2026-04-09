# syntax=docker/dockerfile:1
#
# Freezino Python API — backend image
#
# NOTE: This is a transitional build. It contains a KOSTYL — runtime
# dependencies are installed inline via `pip install <pkg> ...` instead
# of `pip install -r requirements.txt`, because requirements.txt and
# pyproject.toml are scoped under BE-002 (not yet merged) and off-limits
# for the DevOps pass. Tracked in DO-014 — remove the inline install
# block and restore `COPY requirements.txt && pip install -r` once
# BE-002 lands.
#
# Similarly, main.py hardcodes sqlite3.connect("freezino.db") relative
# to CWD, ignoring DB_PATH env var. docker/entrypoint.sh symlinks the
# persistent volume file into CWD as a workaround. Tracked in DO-016.

# ================================
# Build stage — install deps into a user-local site-packages dir
# ================================
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Build deps for bcrypt / cryptography wheels that don't ship prebuilt.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# --- KOSTYL start (see DO-014) ---
# Runtime dependencies pinned inline. Keep in sync with what main.py imports.
# bcrypt is pinned to <4.1 because passlib 1.7.x + bcrypt 4.1+ raises a
# misleading "password cannot be longer than 72 bytes" error on any hash call
# (upstream incompat; see https://github.com/pyca/bcrypt/issues/684). DO-014
# should unpin once BE-002 / BE-005 upgrade to a passlib-free hash impl or
# pin bcrypt itself.
RUN pip install --user --no-warn-script-location \
        "fastapi>=0.110,<1.0" \
        "uvicorn[standard]>=0.29,<1.0" \
        "pydantic[email]>=2.6,<3.0" \
        "python-jose[cryptography]>=3.3,<4.0" \
        "passlib[bcrypt]>=1.7,<2.0" \
        "bcrypt>=4.0,<4.1" \
        "python-multipart>=0.0.9"
# --- KOSTYL end ---

# ================================
# Runtime stage
# ================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/root/.local/bin:$PATH

WORKDIR /app

# Runtime deps: ca-certs (TLS) + wget (HEALTHCHECK).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        wget \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from the builder stage.
COPY --from=builder /root/.local /root/.local

# Copy application code. Only main.py is required at runtime right now.
# Once BE-003 splits main.py into app/ + migrations/, add those back.
COPY main.py ./

# Entrypoint symlinks the SQLite file into CWD (KOSTYL — see DO-016).
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Persistent data dir — named volume mounts here from docker-compose.
RUN mkdir -p /app/data

EXPOSE 3000

# Use 127.0.0.1 explicitly — `localhost` resolves to ::1 in some container
# /etc/hosts setups, and uvicorn binds only to 0.0.0.0 (IPv4).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
