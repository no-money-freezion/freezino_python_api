#!/bin/bash
# ================================================
# Freezino Python API — Deployment Script
# ================================================
# Adapted from ../freezino/deploy.sh (Go version).
# Docker-based, language-agnostic.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# Prefer docker compose v2, fall back to docker-compose v1.
if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DC="docker-compose"
else
    log_error "Neither 'docker compose' (v2) nor 'docker-compose' (v1) is installed"
    exit 1
fi

check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Please create a .env file based on .env.example"
        exit 1
    fi
    log_success ".env file found"
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running!"
        exit 1
    fi
    log_success "Docker is running"
}

stop_containers() {
    log_info "Stopping existing containers..."
    $DC -f docker-compose.prod.yml down
    log_success "Containers stopped"
}

build_images() {
    log_info "Building Docker images (--no-cache)..."
    $DC -f docker-compose.prod.yml build --no-cache
    log_success "Docker images built"
}

start_containers() {
    log_info "Starting containers..."
    $DC -f docker-compose.prod.yml up -d
    log_success "Containers started"
}

check_health() {
    log_info "Waiting for services to become healthy..."
    sleep 10

    if $DC -f docker-compose.prod.yml ps | grep -q "backend.*healthy"; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check pending (may become healthy shortly)"
    fi

    if $DC -f docker-compose.prod.yml ps | grep -q "frontend.*healthy"; then
        log_success "Frontend is healthy"
    else
        log_warning "Frontend health check pending"
    fi
}

show_status() {
    log_info "Container status:"
    $DC -f docker-compose.prod.yml ps
}

backup_db() {
    log_info "Creating database backup..."
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/freezino_backup_$TIMESTAMP.db"

    # Copy SQLite DB out of the backend container.
    # Path inside container: /app/data/freezino.db (see docker-compose.prod.yml).
    docker cp freezino-backend-prod:/app/data/freezino.db "$BACKUP_FILE" 2>/dev/null || true

    if [ -f "$BACKUP_FILE" ]; then
        log_success "Database backed up to $BACKUP_FILE"
    else
        log_warning "No database found to backup (normal on first deploy)"
    fi

    # Rotate: keep only the last 7 days.
    find "$BACKUP_DIR" -name "freezino_backup_*.db" -mtime +7 -delete 2>/dev/null || true
}

cleanup() {
    log_info "Cleaning up dangling Docker images..."
    docker image prune -f
    log_success "Cleanup complete"
}

deploy() {
    echo ""
    log_info "============================================"
    log_info "   FREEZINO PYTHON API — DEPLOYMENT"
    log_info "============================================"
    echo ""

    check_docker
    check_env
    backup_db
    stop_containers
    build_images
    start_containers
    check_health
    show_status
    cleanup

    echo ""
    log_success "============================================"
    log_success "   DEPLOYMENT COMPLETE!"
    log_success "============================================"
    echo ""
    log_info "Health check: curl https://freezino.online/api/health"
    log_info "Logs:         $DC -f docker-compose.prod.yml logs -f"
    echo ""
}

deploy_dev() {
    log_info "Deploying in DEVELOPMENT mode..."
    $DC up -d
    $DC ps
    log_success "Development environment is running"
    log_info "Frontend: http://localhost:5173"
    log_info "Backend:  http://localhost:3000"
    log_info "Nginx:    http://localhost:8080"
}

case "${1:-prod}" in
    dev)
        deploy_dev
        ;;
    prod)
        deploy
        ;;
    stop)
        log_info "Stopping all containers..."
        $DC -f docker-compose.prod.yml down
        log_success "All containers stopped"
        ;;
    restart)
        log_info "Restarting containers..."
        $DC -f docker-compose.prod.yml restart
        log_success "Containers restarted"
        ;;
    logs)
        $DC -f docker-compose.prod.yml logs -f
        ;;
    backup)
        backup_db
        ;;
    clean)
        log_warning "This will remove all containers, volumes, and images!"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $DC -f docker-compose.prod.yml down -v
            docker system prune -af --volumes
            log_success "Cleanup complete"
        fi
        ;;
    *)
        echo "Usage: $0 {dev|prod|stop|restart|logs|backup|clean}"
        echo ""
        echo "Commands:"
        echo "  dev      Deploy in development mode (local Vite + uvicorn reload)"
        echo "  prod     Deploy in production mode (default) — build + start + health"
        echo "  stop     Stop all containers"
        echo "  restart  Restart all containers"
        echo "  logs     Follow logs from all services"
        echo "  backup   Snapshot SQLite DB to ./backups/"
        echo "  clean    Remove all containers, volumes, and images"
        exit 1
        ;;
esac
