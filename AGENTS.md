# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Argus® by Mincka is a static front-end Structural Health Monitoring (SHM) web application. It uses vanilla HTML/CSS/JS with no build tools, no package manager, no framework, and no backend. All data is hardcoded mock data in `js/data.js`. External libraries (Three.js, Chart.js, Google Fonts) are loaded via CDN.

### Running the application

Serve the static files with any HTTP server from the workspace root:

```
python3 -m http.server 8000
```

- Main app: `http://localhost:8000/`
- SHM sub-app: `http://localhost:8000/shm/`

Do not open `index.html` via `file://` — JS script loading requires an HTTP server.

### Key caveats

- There is no `package.json`, no lockfile, no build step, no linter, and no test framework configured in this repo.
- The SHM sub-app (`/shm/`) calls an external API at `https://mincka-shm.com/api`. This may be unreachable from cloud environments; the main app works fully offline with local mock data.
- State is stored in `localStorage` via `js/state.js`.
- The `desing-system/` directory (note: intentional typo in the repo) contains design system HTML documentation.
