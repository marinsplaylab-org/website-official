# Marins PlayLab - Official Website
Marins PlayLab is an independent space for exploring STEM and more through interactive open projects, visuals, experiments, and discoveries.
This is a small passion project and it is still in an early phase. The goal is simple: make learning clear and fun. You will find short educational posts, science updates, visual explanations, and small projects you can try yourself, including simulations that help you explore ideas, not just read about them.
Contributions are welcome. Some parts of the workflow use AI to speed things up, but everything is reviewed so posts and projects stay as accurate and reliable as possible.
The goal is to grow this space and its community. Over time, more topics will be added as the project grows.

It is built using HTML, CSS, Bootstrap (local files), self-hosted fonts (Oxanium, Source Sans 3, Fira Code), and reusable header/footer/project includes to make it easy to extend and maintain.

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
│   │   ├── FiraCode-VariableFont_wght.ttf
│   │   ├── OFL.txt
│   ├── fonts-oxanium/
│   │   ├── OFL.txt
│   │   └── Oxanium-VariableFont_wght.ttf
│   └── fonts-source-sans-3/
│       ├── OFL.txt
│       ├── SourceSans3-Italic-VariableFont_wght.ttf
│       └── SourceSans3-VariableFont_wght.ttf
├── css/
│   ├── bootstrap.min.css
│   └── style.css
├── images/
│   ├── favicon.jpg
│   ├── projects/
│   │   └── solar-system.jpg
│   ├── logo.jpg
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
- Use root-absolute asset paths (like `/css/style.css`) so deep links and `404.html` work with or without a trailing slash
- The website is mobile-friendly and built with responsive design in mind
- Code style: CSS/JS use brace-on-new-line formatting and keep comments short and clear
- Fonts are self-hosted in `assets/` (Oxanium, Source Sans 3, Fira Code)
- Font files are under the SIL Open Font License (OFL) and were downloaded from https://fonts.google.com
- Security headers (including CSP) are defined in `.htaccess`

## Homepage Projects
Homepage project list markup lives in `templates/home-project-list.html`.
It is loaded into the `#projects` container via `/js/template-loader.js`.
Bluesky updates are rendered by `/js/bsky-feed.js` using the public API.

Project card style guidelines:
- Use a square thumbnail (`.project-thumb`) and keep copy to 1–2 short sentences.
- For live projects, add badges inside `.project-meta` (for example: WebGL 2, Prototype, Open source).
- Use accent badges for status: `.project-badge--prototype` (orange) and `.project-badge--upcoming` (red).
- For upcoming items, keep the status text as "Coming soon" and use the red badge style for emphasis.

## Tuning Guide (Examples)
Use this section when you want to adjust layout or behavior quickly.

### Project Thumbnail Ratio
The image ratio lives in `css/style.css` under `.project-thumb`:
- `aspect-ratio: 1 / 1` gives a modern square.
- Example changes:
  - `4 / 3` = more horizontal content, less crop on wide images.
  - `3 / 2` = wider preview look, less height.
  - `16 / 9` = cinematic, but text feels taller compared to the image.
`object-fit: cover` keeps images from stretching; it crops instead.

### Bluesky Feed Settings
The Bluesky feed container lives in `index.html` as `#bsky-feed`:
- `data-bsky-handle` sets the account handle (example: `marinsplaylab.org`).
- `data-bsky-limit` sets how many posts to show (example: `3`).
Example change:
- Set `data-bsky-limit="5"` to show more updates.
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

## Unity WebGL Setup
Use a folder-based page so the route can be extensionless:

1. Create a folder like `[PROJECT-NAME]/`.
2. Add an `index.html` that follows your project page format (for example, `[PROJECT-NAME]/index.html`).
3. Use `<body class="unity-page">` so the Unity canvas is full screen.
4. Optional: include `<div id="header"></div>` plus `/js/template-loader.js` to show the site header on hover (no footer).
5. Include `/js/unity-loader.js` and a small init script (example: `/js/solar-system-init.js`) that calls `loadUnity("unity-root")` after DOMContentLoaded.
6. Copy Unity build output into the same folder:
   - `YourProjectName.data.br`
   - `YourProjectName.framework.js.br`
   - `YourProjectName.loader.js`
   - `YourProjectName.wasm.br`
   - `StreamingAssets/` (if present)
   - `TemplateData/` only if you use Unity's default WebGL page assets
   Keep these files next to `index.html` (no subfolders).
7. Ensure file names in `index.html` match that project's Unity output (for example: `YourProjectName.*`).
8. Build for WebGL 2.0 (minimum) with WebAssembly 2023 (IL2CPP) and use WebGL-compatible lit shaders (MarinsPlayLab custom shaders if applicable).
9. Do not use older or obsolete WebGL APIs or deprecated Unity code paths.
10. Use Brotli builds and keep the Brotli header block enabled in `.htaccess` (this site expects `.br` assets).
11. Link to it using `/[PROJECT-NAME]` (no `.html`).

## Open Source and Transparency
The website and its projects are published openly on https://github.com/marinsplaylab-org/ so people can learn from them, reuse them, and improve them. The site is early stage, so updates will arrive gradually.

## Privacy
No ads. No aggressive tracking. We try to use only essential services to run the site and projects. If a third party service is involved, their policies apply and they handle their own data.
Privacy Policy: https://marinsplaylab.org/privacy-policy
Terms of Service: https://marinsplaylab.org/terms-of-service

## Tech Used
- HTML
- CSS
- Bootstrap 5 (self-hosted with local files)
- JavaScript
- Oxanium (self-hosted font)
- Source Sans 3 (self-hosted font)
- Fira Code (self-hosted font)
- Bluesky public API (public.api.bsky.app)
- Unity (WebGL)
- Brotli-compressed Unity builds (.br)
- Apache/LiteSpeed .htaccess (extensionless routes, Brotli headers)
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
