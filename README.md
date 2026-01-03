# marinsplaylab.org Website
Source code and template design for the marinsplaylab.org website.
Core site structure, shared template design, styles, and project builds used by the live site.

Built with HTML, CSS, local Bootstrap, and self-hosted WOFF2 fonts (Oxanium, Source Sans 3, Fira Code).
MIT License. See `LICENSE`.

## Project Structure (Overview)
- Root pages: `index.html`, `about.html`, `privacy-policy.html`, `terms-of-service.html`, `403.html`, `404.html`, `500.html`, `503.html`
- Templates: `templates/`
- Styles: `css/` (shared)
- Shared CSS modules: `css/style.css` (global), `css/home.css` (homepage), `css/unity.css` (Unity pages), `css/content.css` (text pages)
- Scripts: `js/` (shared)
- Homepage scripts: `js/home/`
- Global media: `media/`, `fonts/`
- Project media: `/<project>/media/`
- Project-only styles/scripts: `/<project>/`
- Project builds: `solar-system/`, `nexus/`, `stem-toolkits/`

## Forking and Project Sources
- The template design lives in `templates/`, `css/`, and `js/`.
- Project folders in this repo are open-source deployment builds, not development source files.
- For full project source, visit the related repositories at https://github.com/marinsplaylab-org/.

## Run Locally (macOS / Linux)
1. Open Terminal and navigate to the project folder:
```bash
cd /path/to/marinsplaylab-website
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
- Run the site through a local server (do not open `index.html` via `file://`).
- JavaScript is required to load shared templates and homepage content; the no-JS warning appears if scripts do not run.
- Use root-absolute paths (for example `/css/style.css`) so deep links and error pages work consistently.
- Media uses modern formats only: WebP for raster images, SVG for icons, and WOFF2 for fonts.
- Python 3 is only used for local testing (optional).
- Text pages (About, Policies, error pages) load `css/content.css` for typography and layout.

## Homepage Projects
- Markup lives in `templates/home-project-list.html` and is injected into `#projects` via `/js/template-loader.js`.
- Homepage layout styles live in `css/home.css`.
- Homepage interactions (cards, feed) live in `/js/home/`.
- Bluesky updates are rendered by `/js/home/bsky-feed.js` using the public API and cached in `localStorage` (`mpl_bsky_cache_v1`) for 12 hours.
- If the network fails or a 429 occurs, cached content is shown with a small notice.

## STEM Toolkits
- Data lives in `stem-toolkits/data/` (categories and tool definitions).
- Page layout lives in `stem-toolkits/index.html` with styles in `stem-toolkits/stem-toolkits.css`.
- Rendering logic lives in `stem-toolkits/stem-toolkits.js`.
- File map: `/stem-toolkits/index.html` (page layout)
- File map: `/stem-toolkits/data/*.json` (tool/category data)
- File map: `/stem-toolkits/stem-toolkits.js` (rendering logic)
- File map: `/stem-toolkits/stem-toolkits.css` (page styles)

## Adding a Project
- Create a folder like `/my-project/` with an `index.html` entry page
- Add a card to `templates/home-project-list.html` with title, summary, badges, and link
- Place a WebP preview in `/<project>/media/` and reference it in the project card
- Add the route to `sitemap.xml`
- For Unity WebGL, follow the "Unity WebGL Setup" section below

## Deployment Config (.htaccess)
- Security headers (CSP, HSTS, Referrer-Policy, Permissions-Policy) and caching rules live in `.htaccess`.
- If you remove Bluesky or Cloudflare, remove those domains from the CSP.

## Unity WebGL Setup
- Create a folder like `[PROJECT-NAME]/` with its own `index.html`.
- Include `/css/unity.css` in Unity project pages for shared layout styles.
- Keep the Unity build files next to that `index.html` (`[PROJECT-NAME].data.br`, `.framework.js.br`, `.loader.js`, `.wasm.br`).
- Ensure `solar-system/index.html`-style data attributes match your build filenames.
- Build for WebGL 2.0 and WebAssembly 2023, and keep Brotli enabled in `.htaccess`.
- Link to it using `/[PROJECT-NAME]` (no `.html`).

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

## Contributing / Feedback
This is an open-source project. At the moment, we are **not accepting code pull requests**.

You can help with:
- Issues: bug reports, feature requests, scientific corrections, attribution fixes
- PRs: documentation only (no code changes)

Code PRs may be closed without review. If you want to propose a code change, please open an issue first.

## Testing
Run these checks before deploying:
- Lighthouse (Chrome DevTools) on `index.html` and `solar-system/index.html`
- Deactivate JavaScript or simulate a failed network request to confirm the homepage fallback still shows content
- Confirm the Unity page loads and the Brotli assets return `Content-Encoding: br` with correct MIME types
- On production, verify headers with:
  - `curl -I https://marinsplaylab.org/solar-system/Solar-System.wasm.br`
  - `curl -I https://marinsplaylab.org/css/style.css`
