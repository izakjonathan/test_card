# v24 Background Root Cause + Review

Root cause: previous backgrounds were placed behind the app with negative z-index/body pseudo layers or hidden by body/main stacking contexts. This build imports the uploaded image as a bundled asset and renders it as a z-0 child inside the app main; all UI content is z-10. It no longer relies on public URL routing for the visible background.

- [x] app-bg.jpg exists
- [x] public/bg.jpg fallback exists
- [x] imported bg used
- [x] background layer z0
- [x] content z10
- [x] no BackgroundScene
- [x] settings button
- [x] settings popup
- [x] rounds heading removed
- [x] section balance
- [x] AnimatePresence balance
- [x] store exists
- [x] package build
