// Loads shared HTML includes into placeholders and updates layout variables.
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

function updateLayoutVars()
{
  const header = document.getElementById("header");
  const footer = document.getElementById("footer");
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = footer ? footer.offsetHeight : 0;

  document.documentElement.style.setProperty("--site-header-height", `${headerHeight}px`);
  document.documentElement.style.setProperty("--site-footer-height", `${footerHeight}px`);
}

// Load header/footer templates and update layout sizing once they are in place
Promise.all([
  loadHTML("header", "/templates/header.html"),
  loadHTML("footer", "/templates/footer.html"),
  loadHTML("gallery", "/templates/gallery.html")
]).then(updateLayoutVars);

window.addEventListener("resize", updateLayoutVars);