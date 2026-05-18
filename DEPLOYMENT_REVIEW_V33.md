
# v33 Root Deploy-Safe Review

## Actual root cause most likely
Previous ZIP files put the real Next.js project inside a nested `rummy500-nextjs/` folder.
If that folder is pushed/imported incorrectly, Vercel sees a repository root with no `package.json`, or the wrong root directory, causing deployment errors even when the app code is valid.

## What this build changes
- `package.json` is now at the ZIP root.
- `app/`, `components/`, `lib/`, `store/`, `public/` are all at the ZIP root.
- No nested `rummy500-nextjs` folder is required.
- Background is a normal public asset: `public/bg.jpg`.
- `RummyApp.tsx` uses `backgroundImage: "url('/bg.jpg')"` in a visible z-0 app layer.
- Removed static `app/app-bg.jpg` import to avoid image import edge cases.
- No `BackgroundScene` component.
- No body pseudo-element background.
- Right header pill opens settings.
- Center settings icon removed.
- Rounds heading above card removed.

## Deployment
Upload/push the contents of this folder as the project root.

Vercel settings:
- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave blank/default
- Root directory: leave blank/default because this ZIP is root-level

## Background
To change the background:
replace `public/bg.jpg` and keep the filename exactly `bg.jpg`.
