# Freezino Design System

**Freezino** is an educational casino simulator web app — a mission-driven product that uses the visual language of real casinos (red + gold, dark chrome, glowing accents, slot-machine flourishes) to help users *feel* how fast virtual money disappears. No real money ever changes hands. The design system is deliberately aggressive and tacky in the "classic Vegas" way, because that's the point: the UI is part of the lesson.

## Source

- **Repo:** [smoreg/freezino](https://github.com/smoreg/freezino) (branch `main`)
- **Frontend:** React 19 + TypeScript + Vite + **TailwindCSS 4** + Framer Motion + Zustand + react-i18next (EN / RU / ES)
- **Backend:** Go 1.21 + Fiber + GORM + SQLite (not relevant to design)
- **Design tokens live in:** `frontend/tailwind.config.js` — the entire theme override is literally three colors (`primary #DC2626`, `secondary #FBBF24`, `dark #1F2937`), with the rest of the UI built on Tailwind's default slate/gray scale.

## Products represented

1. **Freezino App** — the authenticated casino experience: dashboard, games (roulette, slots, blackjack, crash, hi-lo, wheel), work timer, shop (clothing / cars / houses / accessories), profile, loans, stats.
2. **Public pages** — login, about, contact, legal (terms / privacy / cookies).

Games are the core surface. The shop is the secondary reward loop ("look at what you *could* have bought with the money you just lost"). The work timer is the brutal counterpoint — you grind 3 minutes to earn $500, which you can lose in one spin.

---

## Content fundamentals

**Voice:** Direct, second-person, slightly wry. The product is a warning dressed as a game, so copy oscillates between casino excitement ("🎰 SPIN", "ALL IN", "JACKPOT") and sobering reminders ("Play Responsibly", "Virtual currency only", "Educational tool").

**Casing:** Sentence case for body, Title Case for page titles, **ALL CAPS** reserved for high-drama moments (SPIN, ALL IN, WIN). Never use all-caps for navigation.

**Person:** You / your. "Your balance", "You won", "Try again".

**Examples from the product:**
- Login: *"Казино-симулятор против игровой зависимости"* (Casino simulator against gambling addiction)
- Shop header: *"Spend your virtual dollars on exclusive items"*
- Dashboard banner: *"Educational purposes only"*
- Footer of sidebar: *"Play Responsibly"*, *"Virtual currency"*
- Roulette button: *"SPIN"* / *"SPINNING…"*

**Emoji:** Used heavily and on purpose. 🎰 🎲 🎡 🃏 💰 🛍️ 🚪 👤 🔊 🔇 🎵 🎓 — they replace icon fonts entirely. In the source there is **no icon library** beyond a few hand-rolled hamburger/Google SVGs. Emoji is the icon system. We flag this below.

**Tone knobs:**
- Excited for wins → gold + confetti + scale animation
- Somber for losses → red border, "Try again", no celebration
- Neutral for work / shop → gray chrome, factual

---

## Visual foundations

**Palette:** Dark-first always. `gray-900` page → `gray-800` card → `gray-700` raised control. Red (`#DC2626`) for brand, CTAs, active nav, danger. Gold (`#FBBF24`) for money and wins. Green (`#10B981`) reserved for win toasts and balance confirmation. Shop rarity tiers (common/rare/epic/legendary) extend the palette with gray/blue/purple/gold.

**Typography:** The frontend ships only Tailwind's default system-ui stack — there is **no custom font file** in the repo. This design system substitutes **Inter** (Google Fonts) as the nearest production match and **JetBrains Mono** for money displays. **⚠️ Flag: no brand font exists. Ask the user if Inter is acceptable or if they want a real casino display face (e.g. a Playfair/Bodoni for the logo treatment).**

**Backgrounds:** Flat dark surfaces are the default. Two special background treatments appear in the code:
1. Full-page diagonal gradient `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900` on shop and some game screens.
2. Saturated casino gradient `from-gray-900 via-purple-900 to-gray-900` on the slot machine page (the only place purple appears).
No hand-drawn illustrations, no photography (other than shop item photos), no textures, no patterns.

**Animation:** Framer Motion everywhere. Signature moves:
- Card hover: `scale: 1.05, y: -5` over 0.2s
- Tap: `scale: 0.98`
- Page enter: fade + slide up 20px
- Wins: confetti + scale pulse + glow
- Roulette wheel: `ease: 'easeOut'` over 4s with 5 full rotations + target
- Slot reels: 20–40 rapid position swaps, staggered reel stop
- Rare / legendary items: infinite opacity breathe on the border
- Spinner: pure rotation, 1s linear infinite

**Hover states:** Primary buttons darken (`bg-red-600 → bg-red-700`). Cards gain a colored border + shadow glow (`hover:shadow-primary/30`). Nav items slide right 1px (`hover:translate-x-1`) and gain a lighter bg.

**Press states:** `whileTap={{ scale: 0.98 }}` on Framer-wrapped buttons; non-motion buttons rely on Tailwind's default active state.

**Borders:** Every card has a visible `border border-gray-700`. On hover/focus/selection they shift to `border-primary`. Borders are 1px except slot-machine cabinet (8px yellow-600) and selected shop cards (2px by rarity color).

**Shadows:** Elevation through `shadow-lg` + colored `shadow-primary/30` or `shadow-yellow-500/50` glows. Legendary items get an infinite pulsing yellow outline. No soft neumorphism, no inner shadows.

**Transparency & blur:** Used sparingly. The paytable overlay uses `bg-gray-800/50 backdrop-blur-sm`. Modals use `bg-black/50` backdrops. Red debt chip uses `bg-red-900/50`. No glass-everywhere trend.

**Corner radii:** `rounded-lg` (8px) for buttons/inputs, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for the slot-machine inner panel, `rounded-3xl` (24px) for the cabinet itself, `rounded-full` for chips, avatars, pills, rarity badges.

**Cards:** `bg-gray-800 border border-gray-700 rounded-xl p-6`. That's the canonical card. Variants add a colored border (rarity, active state) and colored shadow glow.

**Layout rules:** Sticky header (`sticky top-0 z-50`), fixed sidebar on desktop (`lg:sticky top-0`), mobile uses a hamburger → slide-in drawer. Content lives in `container mx-auto px-4` or `max-w-7xl mx-auto`. Game pages break the layout entirely and go full-bleed with their own backgrounds.

**Grid:** Game dashboard is 1 / 2 / 3 / 4 column responsive. Shop is same. Stats rows are 3-column on desktop.

---

## Iconography

**Primary system: emoji.** The product uses Unicode emoji for essentially every icon:

| Role | Glyph |
| --- | --- |
| Logo / slot | 🎰 |
| Dice / craps | 🎲 |
| Roulette | 🎡 |
| Cards / blackjack | 🃏 |
| Money / balance | 💰 |
| Shop | 🛍️ |
| Work / time | ⏰ |
| Profile | 👤 |
| Logout | 🚪 |
| Music on/off | 🎵 / 🔇 |
| SFX on/off | 🔊 / 🔈 |
| Hamburger | ☰ |
| Close | ✕ |
| Stats | 📊 🏆 🎮 |
| Education | 🎓 |

**Secondary: hand-rolled SVG.** Two places only — the hamburger menu stroke icon in `Header.tsx` and the Google logo on login. No icon library is installed (no lucide, heroicons, phosphor, etc).

**Recommendation:** This design system ships emoji as-is (they're part of the brand's tacky-casino tone) AND substitutes **Lucide** (via CDN) as an optional neutral set for settings / UI chrome where emoji feels out of place (form fields, nav chrome, table headers). Flagged as a substitution.

No iconography from the codebase was importable as SVG/PNG. Logo is literally the text `🎰 FREEZINO` styled in `text-primary` — there is no logo file. **⚠️ Flag: no logo mark exists. Provide one or confirm the emoji-wordmark treatment is intentional.**

---

## File index

```
Freezino Design System/
├── README.md                 ← you are here
├── SKILL.md                  ← Agent Skill manifest
├── colors_and_type.css       ← CSS vars: palette, type scale, radii, motion
├── fonts/                    ← (empty — using Google Fonts CDN)
├── assets/
│   └── shop/                 ← sample shop imagery (cars, clothing, accessories)
├── preview/                  ← small specimen cards for the Design System tab
│   ├── colors-*.html
│   ├── type-*.html
│   ├── components-*.html
│   └── brand-*.html
└── ui_kits/
    └── freezino_app/
        ├── index.html        ← click-thru: login → dashboard → game → shop
        ├── README.md
        ├── Header.jsx
        ├── Sidebar.jsx
        ├── GameCard.jsx
        ├── ItemCard.jsx
        ├── LoginScreen.jsx
        ├── Dashboard.jsx
        ├── SlotsScreen.jsx
        ├── RouletteScreen.jsx
        └── Shop.jsx
```

---

## Caveats & substitutions

- **Fonts:** no brand font in repo. Substituted **Inter** + **JetBrains Mono** from Google Fonts.
- **Logo:** no logo mark in repo. The product uses the text `🎰 FREEZINO` with the emoji as the visual anchor. Kept as-is.
- **Icons:** no icon library in repo. Emoji is the system. Lucide offered as an optional neutral fallback, loaded from CDN when used.
- **Shop images:** only a handful of the ~55 shop JPGs are imported into `assets/shop/` as samples. Bulk-importing the rest would be easy; ask if you need them.
- **No slide templates** were provided, so no `slides/` folder was created.
