# v31 deployment review

Root cause of v29/v30 deployment failure:
- RummyApp.tsx was corrupted by regex patching. The opening app layout was deleted and JSX resumed in the middle of the scoreboard block, causing Vercel's parser error.

What was changed in v31:
- Rebuilt from v28, the last syntactically valid functional base.
- No broad JSX regex rewrites.
- Background image copied to both `app/app-bg.jpg` and `public/bg.jpg`.
- Existing imported background mechanism preserved: `import appBg from "@/app/app-bg.jpg"`.
- Added html/body/main fullscreen CSS only.
- Removed center settings icon and moved settings to the right Game pill.
- Removed scoreboard leading subtitle.
- Removed Rounds / x rounds heading above the rounds card.

Checks performed:
- TypeScript parse check run with `tsc --noEmit --jsx preserve ...`.
- Expected missing-module errors are acceptable in this sandbox without node_modules.
- No TS1005/TS1128 parser errors from RummyApp.tsx.
