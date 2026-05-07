# Freezino App UI Kit

A clickable recreation of the Freezino web app's core surfaces — login → dashboard → roulette / slots → shop. Built with React 18 via Babel Standalone (no build step) and TailwindCSS via CDN to mirror the real stack.

Components:
- `LoginScreen.jsx` — dual-mode (login / register) form + Google OAuth button
- `Shell.jsx` — `Header` + `Sidebar` authenticated frame
- `Dashboard.jsx` — welcome, stats, game grid, educational banner
- `GameCard.jsx` — the hover-scale game tile used on the dashboard
- `RouletteScreen.jsx` — wheel, recent numbers, betting board, chip selector
- `SlotsScreen.jsx` — 5-reel slot cabinet with paytable
- `Shop.jsx` — filterable grid of rarity-tiered items
- `ItemCard.jsx` — shop tile with owned / rarity badges

These are simple cosmetic versions — state is local, no real API calls. The goal is pixel fidelity to the real UI's look-and-feel, not feature parity.
