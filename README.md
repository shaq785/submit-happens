# Submit Happens

A responsive, tap-first browser game built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and a small **global SCSS** animation layer. Fill a weekly timesheet to **40+ hours** and tap **Submit timesheet** before the **HR reminder meter** reaches **100%**.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ recommended (matches Next.js 16 expectations)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Production build         |
| `npm run start` | Run the production build |
| `npm run lint`  | Run ESLint               |

## How to play

1. Tap a **time card** in the tray (it highlights with ring, motion, and “Selected” copy).
2. Tap a **weekday column** to place that card.
3. A **new card** replaces the one you used.
4. Reach **at least 40 hours** total, then tap **Submit timesheet** before the HR meter fills.

HR **pop-ups** appear on a timer; the dimmed overlay does not block taps on the board—tap the card to dismiss. **Share Score** uses the Web Share API when available, otherwise copies text to the clipboard and shows **Copied!**.

## Deploy

- **Vercel:** connect the repo and use the default Next.js preset (`npm run build` / `.next` output).
- **Netlify:** use the official Next.js runtime (for example the Netlify Next plugin) so server features and routing work as expected; static export is not required for this app.

## Project layout

- `src/app` — App Router entry (`page.tsx`, `layout.tsx`, `globals.css`)
- `src/components/game` — UI pieces (`GameShell`, board, tray, meter, pop-up, end screens)
- `src/lib` — card generation and tunable constants
- `src/styles/game-animations.scss` — keyframes (wiggle, meter pulse, selected card)
- `src/types/game.ts` — shared types

Game rules, pacing, and copy are centralized in `src/lib/gameConstants.ts` and `src/lib/generateRandomCard.ts` so you can extend difficulty, streaks, or new card types without rewiring the UI.
