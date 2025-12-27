# Marins PlayLab - Official Website
Marins PlayLab is an independent space for exploring STEM and more through interactive open projects, visuals, experiments, and discoveries.
This is a small passion project and it is still in an early phase. The goal is simple: make learning clear and fun. You will find short educational posts, science updates, visual explanations, and small projects you can try yourself, including simulations that help you explore ideas, not just read about them.
Contributions are welcome. Some parts of the workflow use AI to speed things up, but everything is reviewed so posts and projects stay as accurate and reliable as possible.
The goal is to grow this space and its community. Over time, more topics will be added as the project grows.

It is built using HTML, CSS, Bootstrap, and reusable header/footer includes to make it easy to extend and maintain.

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
├── data/
│   └── gallery.json
├── index.html
├── privacy-policy.html
├── solar-system/
│   ├── Build/
│   │   ├── Solar-System.data.br
│   │   ├── Solar-System.framework.js.br
│   │   ├── Solar-System.loader.js
│   │   └── Solar-System.wasm.br
│   └── index.html
├── terms-of-service.html
├── templates/
│   ├── header.html
│   └── footer.html
├── robots.txt
├── sitemap.xml
├── css/
│   └── style.css
├── js/
│   ├── gallery.js
│   ├── include.js
│   └── unity-loader.js
├── scripts/
│   └── build-gallery.py
└── images/
    ├── favicon.jpg
    ├── gallery/
    │   └── solar-system.jpg
    ├── logo.jpg
    └── socials/
        ├── bluesky.svg
        ├── github.svg
        └── x.svg
```

## Run Locally on macOS
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
- A local server is required for header/footer loading (they are fetched from `templates/`)
- Use root-absolute asset paths (like `/css/style.css`) so deep links and `404.html` work with or without a trailing slash
- The website is mobile-friendly and built with responsive design in mind
- Code style: CSS/JS use brace-on-new-line formatting

## Gallery Data
Gallery items are stored in `data/gallery.json`. After editing, run:
```bash
python3 scripts/build-gallery.py
```
This regenerates the gallery markup between `<!-- GALLERY:START -->` and `<!-- GALLERY:END -->` in `index.html`.
Project items use a `video` path (MP4/WebM) and an optional `poster` image for the idle frame.

## Unity WebGL Setup
Use a folder-based page so the route can be extensionless:

1. Create a folder like `[PROJECT-NAME]/`.
2. Add an `index.html` that follows your project page format (for example, `[PROJECT-NAME]/index.html`).
3. Use `<body class="unity-page">` so the Unity canvas is full screen.
4. Optional: include `<div id="header"></div>` plus `/js/include.js` to show the site header on hover (no footer).
5. Include `../js/unity-loader.js` and call `loadUnity("unity-root")`.
6. Copy Unity build output into the same folder:
   - `Build/`
   - `StreamingAssets/` (if present)
   - `TemplateData/` only if you use Unity's default WebGL page assets
7. Ensure file names in `index.html` match that project's Unity output (for example: `Build/YourProjectName.*`).
8. Use Brotli builds and keep the Brotli header block enabled in `.htaccess` (this site expects `.br` assets).
9. Link to it using `/[PROJECT-NAME]` (no `.html`).

## Open Source and Transparency
The website and its projects are published openly on https://github.com/marinsplaylab-org/ so people can learn from them, reuse them, and improve them. The site is early stage, so updates will arrive gradually.

## Privacy
No ads. No aggressive tracking. We try to use only essential services to run the site and projects. If a third party service is involved, their policies apply and they handle their own data.
Full policy: https://marinsplaylab.org/privacy-policy
Terms: https://marinsplaylab.org/terms-of-service

## Tech Used
- HTML
- CSS
- Bootstrap 5
- JavaScript
- Unity (WebGL)
- Brotli-compressed Unity builds (.br)
- Apache/LiteSpeed .htaccess (extensionless routes, Brotli headers)

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
