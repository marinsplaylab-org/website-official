// Boots the Unity WebGL project on the Solar System Simulation page.
// Example: for another project, change the root id or use a new initialization file.
function initializeSolarSystemSimulation()
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

document.addEventListener("DOMContentLoaded", initializeSolarSystemSimulation);
