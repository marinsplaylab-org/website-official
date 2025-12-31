// Loads shared HTML templates into placeholders and updates layout variables.
// Example: changing a template file (header/footer/home list) updates all pages at once.
async function loadHTML(_elementId, _filePath)
{
  try
  {
    const element = document.getElementById(_elementId);
    if (!element)
    {
      return null;
    }

    const response = await fetch(_filePath);
    if (!response.ok)
    {
      throw new Error(`Failed to load ${_filePath}: ${response.status} ${response.statusText}`);
    }

    const data = await response.text();

    element.innerHTML = data;
    return element;
  }
  catch (error)
  {
    console.error(error);
    return null;
  }
}

function initPreloader()
{
  // This preloader is skipped on Unity pages and shown once per session.
  // Remove the sessionStorage block if you want it to run on every page load.
  if (document.body.classList.contains("unity-page"))
  {
    return;
  }

  if (document.readyState === "complete")
  {
    return;
  }

  const key = "mpl_preloader_seen";
  try
  {
    if (sessionStorage.getItem(key) === "true")
    {
      return;
    }

    sessionStorage.setItem(key, "true");
  }
  catch
  {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "site-preloader";
  overlay.innerHTML = `
    <img class="site-preloader-logo" src="/images/favicon.jpg" alt="">
    <div class="site-preloader-spinner" aria-hidden="true"></div>
    <div class="site-preloader-text">Loading</div>
  `;

  document.body.appendChild(overlay);

  const hide = () =>
  {
    overlay.classList.add("is-hidden");
    overlay.addEventListener("transitionend", () =>
    {
      overlay.remove();
    }, { once: true });
    setTimeout(() =>
    {
      overlay.remove();
    }, 1000);
  };

  window.addEventListener("load", () =>
  {
    setTimeout(hide, 150);
  }, { once: true });
}

function updateLayoutVars()
{
  // --vh smooths out mobile browser UI changes; header/footer heights keep layout stable.
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);

  const header = document.getElementById("header");
  const footer = document.getElementById("footer");
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = footer ? footer.offsetHeight : 0;

  document.documentElement.style.setProperty("--site-header-height", `${headerHeight}px`);
  document.documentElement.style.setProperty("--site-footer-height", `${footerHeight}px`);
}

// Load shared templates and update layout sizing once they are in place.
initPreloader();
Promise.all([
  loadHTML("header", "/templates/header.html"),
  loadHTML("footer", "/templates/footer.html"),
  loadHTML("projects", "/templates/home-project-list.html")
]).then(updateLayoutVars);

window.addEventListener("resize", updateLayoutVars);