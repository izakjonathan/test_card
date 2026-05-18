# v29 Fullscreen Review

- Background exists on html/body and as `.app-bg` inside `<main>`.
- `.app-bg` is z-index 0; UI wrapper is `.app-ui` at z-index 10.
- No negative z-index background.
- body and main fixed to viewport.
- Uses 100dvh/100vh and iOS -webkit-fill-available fallback.
- `viewportFit: cover` retained.
- `public/bg.jpg` is the only background file to replace.
