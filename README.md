# Official 100% Open Source Website for https://marinsplaylab.org

This is a fully open source, non-profit website code / build for https://marinsplaylab.org, intended purely for interactive education and exploring STEM research.  
The website is designed to grow over time, adding new features, projects, and content.

It is built using HTML, CSS, Bootstrap, and reusable header and footer templates to make it easy to extend and maintain.

This project is licensed under the MIT License. See the LICENSE file for details.

## Project Structure

```
.
├── index.html
├── templates/
│   ├── header.html
│   └── footer.html
├── css/
│   └── style.css
├── js/
│   └── include.js
└── images/
    ├── favicon.jpg
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
- The website is mobile-friendly and built with responsive design in mind

## Tech Used

- HTML  
- CSS  
- Bootstrap 5  
- JavaScript

## Contributing

This repository is fully open source and contributions are welcome. You can help by:

- Reporting issues  
- Suggesting improvements or new features  
- Adding educational projects or examples  
- Improving documentation

Please make sure any contributions align with the website’s non-profit educational and STEM research mission.

## Future Plans

- Add more interactive educational projects  
- Expand research resources  
- Improve user interface and accessibility  
- Continuously update with new content and features
