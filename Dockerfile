# syntax=docker/dockerfile:1
#
# Freezino Python API — backend image
#
# NOTE: the app hardcodes the SQLite path relative to CWD, ignoring the
# DB_PATH env var. docker/entrypoint.sh symlinks the persistent volume
# file into CWD as a workaround. Tracked in DO-016.

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

COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

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

# Copy application code.
COPY main.py ./
COPY app/ ./app/

# Entrypoint symlinks the SQLite file into CWD (KOSTYL — see DO-016).
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Persistent data dir — named volume mounts here from docker-compose.
RUN mkdir -p /app/data

EXPOSE 3000

# Use 127.0.0.1 explicitly — `localhost` resolves to ::1 in some container
# /etc/hosts setups, and uvicorn binds only to 0.0.0.0 (IPv4).
#
# NOTE: we intentionally don't use `wget --spider` here. --spider sends a
# HEAD request, but main.py only registers @app.get("/api/health"), so
# FastAPI responds 405 Method Not Allowed and wget exits with code 8
# ("broken link"). A GET with output discarded is the safe alternative
# until main.py also handles HEAD (post BE-003).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null --tries=1 http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]