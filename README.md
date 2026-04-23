# Freezino API Documentation

OpenAPI 3.0 specification for Freezino casino simulator API.

## How to View Documentation

### Option 1: Online (easiest)
1. Go to [Swagger Editor](https://editor.swagger.io/)
2. File → Import file → select `openapi.yaml`

Or use [Redocly](https://redocly.github.io/redoc/):
1. Go to https://redocly.github.io/redoc/
2. Enter URL to raw openapi.yaml file

### Option 2: Local HTML Viewer
Open `swagger-ui.html` in any browser - it loads Swagger UI from CDN.

### Option 3: VS Code Extension
1. Install extension: "OpenAPI (Swagger) Viewer" or "Swagger Viewer"
2. Open `openapi.yaml`
3. Press `Ctrl+Shift+P` → "Preview Swagger"

### Option 4: Postman
1. Open Postman
2. Import → File → select `openapi.yaml`
3. Creates a collection with all endpoints

### Option 5: Stoplight Studio (free desktop app)
1. Download from https://stoplight.io/studio
2. Open `openapi.yaml`

## API Overview

- **Version**: 1.1.0
- **Base URL**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000/ws`

### Features
- Local & Google OAuth authentication
- Work system with multiple job types
- Casino games (Roulette, Slots, Blackjack, Crash, Hi-Lo, Wheel)
- Virtual item shop
- Loan system (friends, bank, microcredit)
- Real-time blackjack via WebSocket
# freezino_python_api

## Setup

```bash
pip install -e ".[dev]"
```
### Lint

```bash
ruff check .
```
### Format

```bash
ruff format .
```
### Type checking

```bash
mypy .
```
### Tests

```bash
pytest
```
### Pre-commit

```bash
pre-commit install
pre-commit run --all-files
```