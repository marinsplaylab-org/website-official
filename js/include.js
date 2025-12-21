// Function to load HTML files into a page
async function loadHTML(_elementId, _filePath)
{
  try {
    const response = await fetch(_filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${_filePath}: ${response.status} ${response.statusText}`);
    }

    const data = await response.text();

    const element = document.getElementById(_elementId);
    if (!element) {
      throw new Error(`Missing element with id="${_elementId}"`);
    }

    element.innerHTML = data;
  } catch (error) {
    console.error(error);
  }
}

// Load header template
loadHTML("header", "templates/header.html");

// Load footer template
loadHTML("footer", "templates/footer.html");