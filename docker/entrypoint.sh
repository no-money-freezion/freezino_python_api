#!/bin/sh
# Entrypoint for the freezino Python API container.
#
# KOSTYL — see DO-016.
# main.py hardcodes sqlite3.connect("freezino.db") which resolves
# relative to CWD (/app). We want the database to live in a persistent
# named volume mounted at /app/data, so we symlink the expected path
# into that volume. Remove this script once main.py reads DB_PATH from
# env.

set -e

mkdir -p /app/data

# -f overwrites any stale link from a previous container; the target
# doesn't need to exist yet — sqlite will create the file on first
# connect, through the symlink, directly inside /app/data.
ln -sf /app/data/freezino.db /app/freezino.db

exec "$@"
