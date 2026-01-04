# AGENTS.md
Guidance for automated changes in this repository.

## Project Scope
- Static site for marinsplaylab.org with shared templates and deployed project builds.
- Project build folders are deployment outputs; avoid editing generated build files unless replacing a build.

## Structure Rules
- Shared templates: `templates/`
- Shared CSS modules: `css/style.css`, `css/home.css`, `css/unity.css`, `css/content.css`
- Shared JS: `js/` (homepage scripts in `js/home/`)
- Global media: `media/`
- Fonts (WOFF2 only): `fonts/`
- Project builds: `solar-system-simulation/`, `nexus/`, `stem-toolkits/`
- Project media: `/<project>/media/`
- Project-only CSS/JS should live inside that project folder.

## Asset and Path Rules
- Use root-absolute paths (for example, `/css/style.css`), not `file://`.
- Keep extensionless routes (for example, `/privacy-policy`).
- Raster images: WebP. Icons: SVG. Fonts: WOFF2.
- When renaming/moving assets or folders, update all references and `sitemap.xml` as needed.

## Unity WebGL Pages
- Unity pages use `css/unity.css` and live beside their build files.
- Keep Brotli build files (`.br`) and ensure data- attributes match filenames.
- Current Unity project folder: `solar-system-simulation/`.

## Content and Accessibility
- One H1 per page and maintain semantic heading order.
- Preserve no-JS fallback warnings where they exist.

## Coding Style
- JavaScript uses Allman braces.
- Prefix local variables and function parameters with `_`.
- Do not prefix object fields or properties with `_`.
- Use descriptive, self-explanatory names; longer names are fine.
- Prefer modular, configurable solutions over hardcoded logic.
- Avoid hardcoding values when data/config can drive the behavior.
- When changes affect structure, routes, or assets, update all related references (templates, README, sitemap, scripts).
- Avoid obsolete APIs.
- Keep README and AGENTS in sync when rules change.
- Comments are brief and intent-focused; include what and why, plus an example only when it clarifies non-obvious behavior.
- Use simple English in comments and UI copy; avoid conversational phrasing.

## Suggested Checks
- Run `python3 -m http.server` and open `http://localhost:8000`.
- For Unity builds, verify `.br` assets return `Content-Encoding: br` (see README).
