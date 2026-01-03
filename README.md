# marinsplaylab.org Website
Official source code for marinsplaylab.org with template design and project builds.
It contains the core site structure, shared templates, styles, and example project pages used by the live site.

Built with HTML, CSS, local Bootstrap, and self-hosted WOFF2 fonts (Oxanium, Source Sans 3, Fira Code).
This project is licensed under the MIT License. See the LICENSE file for details.

## Project Structure
```
.
├── .gitignore
├── .htaccess
├── 403.html
├── 404.html
├── 500.html
├── 503.html
├── LICENSE
├── README.md
├── about.html
├── index.html
├── privacy-policy.html
├── terms-of-service.html
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── fonts-fira-code/
│   │   ├── FiraCode-VariableFont_wght.woff2
│   │   └── OFL.txt
│   ├── fonts-oxanium/
│   │   ├── OFL.txt
│   │   └── Oxanium-VariableFont_wght.woff2
│   └── fonts-source-sans-3/
│       ├── OFL.txt
│       ├── SourceSans3-Italic-VariableFont_wght.woff2
│       └── SourceSans3-VariableFont_wght.woff2
├── css/
│   ├── bootstrap.min.css
│   └── style.css
├── images/
│   ├── logo.webp
│   ├── projects/
│   │   ├── nexus.webp
│   │   └── solar-system.webp
│   └── socials/
│       ├── bluesky.svg
│       ├── github.svg
│       └── x.svg
├── js/
│   ├── bootstrap.bundle.min.js
│   ├── bsky-feed.js
│   ├── template-loader.js
│   ├── project-cards.js
│   ├── solar-system-init.js
│   └── unity-loader.js
├── nexus/
│   └── index.html
├── stem-toolkits/
│   └── index.html
├── solar-system/
│   ├── Solar-System.data.br
│   ├── Solar-System.framework.js.br
│   ├── Solar-System.loader.js
│   ├── Solar-System.wasm.br
│   └── index.html
└── templates/
    ├── footer.html
    ├── header.html
    └── home-project-list.html
```

## Key Files
- `index.html` is the homepage shell that loads shared templates and the latest updates area
- `templates/header.html` and `templates/footer.html` are shared layout partials
- `templates/home-project-list.html` defines the homepage project cards
- `css/style.css` holds theme tokens and component styles
- `js/template-loader.js` handles template loading, the preloader, and no-JS state
- `js/bsky-feed.js` fetches Bluesky updates and caches them in localStorage
- `js/project-cards.js` adds card behavior and image fallbacks
- `js/unity-loader.js` and `js/solar-system-init.js` wire Unity WebGL pages
- `.htaccess` contains CSP, security headers, caching, and Brotli config


## Forking and Project Sources
- The template design lives in `templates/`, `css/`, and `js/`.
- Project folders in this repo are deployment builds, not development source files.
- For full project source, visit the related repositories at https://github.com/marinsplaylab-org/.

## Run Locally (macOS / Linux)
1. Open Terminal and navigate to the project folder:
```bash
cd /path/to/website
```

2. Start a local server:
```bash
python3 -m http.server
```

3. Open your browser and go to:
`http://localhost:8000`

### Stop the Local Server
Press `Ctrl + C` in the Terminal where the server is running.

## Notes
- Do not open `index.html` directly using `file://`
- A local server is required for header/footer/project loading (they are fetched from `templates/`)
- JavaScript is required to load shared templates and homepage content (a no-JS warning is shown if scripts do not run)
- Use root-absolute asset paths (like `/css/style.css`) so deep links and `404.html` work with or without a trailing slash
- The website is mobile-friendly and built with responsive design in mind
- Code style: CSS/JS use brace-on-new-line formatting and keep comments short and clear
- Fonts are self-hosted WOFF2 files in `assets/` (Oxanium, Source Sans 3, Fira Code)
- Font files are under the SIL Open Font License (OFL) and were downloaded from https://fonts.google.com
- The site logo and favicon use WebP in `images/`. Project previews use WebP.
- Image assets use modern formats only (WebP for raster, SVG for icons).
- Cloudflare is used in production as a CDN and security proxy.
- Security headers (including CSP) are defined in `.htaccess`

## Homepage Projects
Homepage project list markup lives in `templates/home-project-list.html`.
It is loaded into the `#projects` container via `/js/template-loader.js`.
Bluesky updates are rendered by `/js/bsky-feed.js` using the public API.
If JavaScript is unavailable, the page shows a no-JS warning instead of project cards.

Bluesky feed caching:
- Cached HTML is stored in `localStorage` under `mpl_bsky_cache_v1`.
- Default TTL is 12 hours (`cacheTtlMs` in `js/bsky-feed.js`).
- If the network fails or a 429 rate limit occurs, cached content is shown with a subtle note.

Project card style guidelines:
- Use a square thumbnail (`.project-thumb`) and keep copy to 1–2 short sentences.
- For live projects, add badges inside `.project-meta` (for example: WebGL 2, Prototype, Open source).
- Use accent badges for status: `.project-badge--prototype` (orange) and `.project-badge--upcoming` (red).
- For upcoming items, keep the status text as "Coming soon" and use the red badge style for emphasis.

## Adding a Project
- Create a folder like `/my-project/` with an `index.html` entry page
- Add a card to `templates/home-project-list.html` with title, summary, badges, and link
- Place a WebP preview in `images/projects/` or rely on the placeholder if it is not ready
- Add the route to `sitemap.xml`
- For Unity WebGL, follow the "Unity WebGL Setup" section below

## Tuning Guide (Examples)
Use this section when you want to adjust layout or behavior quickly.

### Project Thumbnail Ratio
The image ratio lives in `css/style.css` under `.project-thumb`:
- `aspect-ratio: 1 / 1` gives a modern square.
- Example changes:
  - `4 / 3` = more horizontal content, less crop on wide images.
  - `3 / 2` = wider preview look, less height.
  - `16 / 9` = cinematic, but text feels taller compared to the image.
`object-fit: cover` keeps images from stretching. It crops instead.

### Bluesky Feed Settings
The Bluesky feed container lives in `index.html` as `#bsky-feed`:
- `data-bsky-handle` sets the account handle (example: `marinsplaylab.org`).
- `data-bsky-limit` sets how many posts to show (example: `3`).
Example change:
- Set `data-bsky-limit="5"` to show more updates.
Caching defaults:
- `cacheTtlMs` in `js/bsky-feed.js` controls cache TTL (12 hours by default).
- If Bluesky rate-limits (429), a short backoff is applied and cached posts are shown.
Images and videos are shown when available:
- Images load from https://cdn.bsky.app.
- Videos use HLS playlists from https://video.bsky.app (some browsers may require native HLS support).

### Unity WebGL Data Attributes
The Unity page uses `data-unity-*` on the container in `solar-system/index.html`:
- `data-unity-data-url`, `data-unity-framework-url`, `data-unity-code-url`, `data-unity-loader-url` must match the Unity build filenames.
- `data-unity-product-name` changes the loading text label.
- `data-unity-product-version` is the version shown during load.
- `data-unity-show-banner="true"` enables the in-canvas warning banner.
Example change:
- If your build outputs `SpaceLab.data.br`, update `data-unity-data-url="SpaceLab.data.br"`.

### Preloader Behavior
The site preloader runs once per session (`sessionStorage` key `mpl_preloader_seen`) in `js/template-loader.js`.
Example change:
- To show it every page load, remove the sessionStorage check block.

## Security Headers (.htaccess)
- CSP is strict by default (`default-src 'self'`) and only allows endpoints needed for Bluesky + Cloudflare Insights:
  - `script-src`: https://static.cloudflareinsights.com
  - `connect-src`: https://public.api.bsky.app https://cloudflareinsights.com
  - `img-src`: https://cdn.bsky.app https://video.bsky.app https://video.cdn.bsky.app
  - `media-src`: https://video.bsky.app
- If you remove Bluesky or Cloudflare Insights, delete those domains from the CSP.
- HSTS is enabled. Ensure the site is served over HTTPS before deploying the `.htaccess` changes.

## Caching
Server cache defaults (from `.htaccess`):
- Fonts (`.woff2`): 1 year
- JS/CSS: 1 day
- Images (`.svg/.webp`): 30 days
- Unity `.br` build files: 1 week

## Unity WebGL Setup
Use a folder-based page so the route can be extensionless:

1. Create a folder like `[PROJECT-NAME]/`.
2. Add an `index.html` that follows your project page format (for example, `[PROJECT-NAME]/index.html`).
3. Use `<body class="unity-page">` so the Unity canvas is full screen.
4. Optional: include `<div id="header"></div>` plus `/js/template-loader.js` to show the site header on hover (no footer).
5. Include `/js/unity-loader.js` and a small init script (example: `/js/solar-system-init.js`) that calls `loadUnity("unity-root")` after DOMContentLoaded.
6. Copy Unity build output into the same folder:
   - `[PROJECT-NAME].data.br`
   - `[PROJECT-NAME].framework.js.br`
   - `[PROJECT-NAME].loader.js`
   - `[PROJECT-NAME].wasm.br`
   - `StreamingAssets/` (if present)
   - `TemplateData/` only if you use Unity's default WebGL page assets
   Keep these files next to `index.html` (no subfolders).
7. Ensure file names in `index.html` match that project's Unity output (for example: `[PROJECT-NAME].*`).
8. Build for WebGL 2.0 (minimum) with WebAssembly 2023 (IL2CPP) and use WebGL-compatible lit shaders (MarinsPlayLab custom shaders if applicable).
9. Do not use older or obsolete WebGL APIs or deprecated Unity code paths.
10. Use Brotli builds and keep the Brotli header block enabled in `.htaccess` (this site expects `.br` assets).
11. Link to it using `/[PROJECT-NAME]` (no `.html`).


## Policies
- Open source: https://github.com/marinsplaylab-org/
- Privacy policy: `/privacy-policy`
- Terms of service: `/terms-of-service`

## Tech Used
- HTML
- CSS
- Bootstrap 5 (self-hosted with local files)
- JavaScript
- Oxanium (self-hosted WOFF2 font)
- Source Sans 3 (self-hosted WOFF2 font)
- Fira Code (self-hosted WOFF2 font)
- Bluesky public API (public.api.bsky.app)
- Unity (WebGL)
- Brotli-compressed Unity builds (.br)
- Apache/LiteSpeed .htaccess (extensionless routes, Brotli headers)
- Cloudflare (CDN and security proxy)
- Python 3 (local server)

## Contributing / Feedback
This is an open-source project. At the moment, we are **not accepting code pull requests**.

You can help with:
- Issues: bug reports, feature requests, scientific corrections, attribution fixes
- PRs: documentation only (no code changes)

Code PRs may be closed without review. If you want to propose a code change, please open an issue first.

## Future Plans
- Add more interactive educational projects
- Expand research resources
- Improve user interface and accessibility
- Continuously update with new content and features

## Testing
Run these checks before deploying:
- Lighthouse (Chrome DevTools) on `index.html` and `solar-system/index.html`
- Deactivate JavaScript or simulate a failed network request to confirm the homepage fallback still shows content
- Confirm the Unity page loads and the Brotli assets return `Content-Encoding: br` with correct MIME types
- On production, verify headers with:
  - `curl -I https://marinsplaylab.org/solar-system/Solar-System.wasm.br`
  - `curl -I https://marinsplaylab.org/css/style.css`