// Boots the Unity WebGL project on the Solar System page.
// Example: for another project, change the root id or use a new init file.
function initSolarSystem()
{
  if (typeof loadUnity !== "function")
  {
    return;
  }

  if (!document.getElementById("unity-root"))
  {
    return;
  }

  loadUnity("unity-root");
}

document.addEventListener("DOMContentLoaded", initSolarSystem);