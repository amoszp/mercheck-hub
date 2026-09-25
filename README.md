# Mercheck Hub

A calm, glassy, mobile-first shopping list PWA. Create multiple lists, check items off, pin the ones you use often, and everything is saved locally on the device — no account, no backend.

## Stack

- **React 18** + **Vite 6** for the app shell and build
- **Tailwind CSS** for styling
- **Framer Motion** for the list/item animations
- **Lucide React** for icons
- **vite-plugin-pwa** — installable PWA with an auto-updating service worker and manifest (standalone display, portrait orientation)
- Data is persisted in `localStorage` (see `src/lib/storage.js` and `src/lib/useLists.js`) — nothing is sent to a server

## Project structure

```
src/
  App.jsx              — root component
  components/          — ActionMenu, Dock, InlineEdit, ItemRow, ListCard, SettingsMenu, Toast
  lib/                  — ids, settings, storage, useDismiss, useLists
  initialData.js        — default lists/items on first run
```

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Deployment

A multi-stage `Dockerfile` is included: it builds the app with Node and serves the static output from `dist/` via Nginx (`EXPOSE 80`). The project is currently deployed on Vercel.
