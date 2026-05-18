# v32 Reviewed Deploy-Safe Build

## Root cause found
The deployment error came from v29/v30 patching RummyApp.tsx with broad regex replacements. That deleted the start of the app layout and left JSX beginning in the middle of the scoreboard section, so Vercel reported a parser error around `className`.

## What this build does differently
- Rebuilt from v28, the last syntactically valid functional base.
- Did not rewrite the JSX tree.
- Only used exact, targeted edits:
  - removed the center settings gear
  - made the right Game pill open the settings popup
  - removed the scoreboard leading subtitle
  - removed the Rounds / x rounds heading above the rounds card
  - added fullscreen-safe CSS
- Kept the existing working app background import:
  `import appBg from "@/app/app-bg.jpg";`
- Copied the background to both:
  - `app/app-bg.jpg`
  - `public/bg.jpg`

## Validation performed
- RummyApp has one `<main>` and balanced section/modal structures.
- TypeScript parse check was run with `tsc --noEmit --jsx preserve`.
- The sandbox reports missing dependency/type modules because `node_modules` is not installed here, but no JSX parser errors were returned.
- Background file exists in both app import and public fallback paths.
