const themeStorageKey = "mpl_theme";
const themeToggleSelector = "[data-theme-toggle]";
const themeLabelSelector = "[data-theme-label]";

function getPreferredTheme()
{
  const root = document.documentElement;
  const themeAttribute = root.getAttribute("data-theme");

  if (themeAttribute === "light" || themeAttribute === "dark")
  {
    return themeAttribute;
  }

  try
  {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === "light" || storedTheme === "dark")
    {
      return storedTheme;
    }
  }
  catch
  {
    return "dark";
  }

  return "dark";
}

function syncNavbarTheme(theme)
{
  const navbars = document.querySelectorAll(".site-navbar");
  navbars.forEach((navbar) =>
  {
    if (theme === "light")
    {
      navbar.classList.remove("navbar-dark");
      navbar.classList.add("navbar-light");
    }
    else
    {
      navbar.classList.remove("navbar-light");
      navbar.classList.add("navbar-dark");
    }
  });
}

function syncThemeToggles(theme)
{
  const nextTheme = theme === "light" ? "dark" : "light";
  const toggleButtons = document.querySelectorAll(themeToggleSelector);
  toggleButtons.forEach((button) =>
  {
    const labelTarget = button.querySelector(themeLabelSelector) || button;
    labelTarget.textContent = nextTheme === "light" ? "Light mode" : "Dark mode";
    button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  });
}

function setTheme(theme, shouldPersist)
{
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-bs-theme", theme);

  if (shouldPersist)
  {
    try
    {
      localStorage.setItem(themeStorageKey, theme);
    }
    catch
    {
      // Ignore storage errors to keep the toggle functional.
    }
  }

  syncThemeToggles(theme);
  syncNavbarTheme(theme);
}

function handleThemeToggleClick(event)
{
  const toggleButton = event.target.closest(themeToggleSelector);
  if (!toggleButton)
  {
    return;
  }

  event.preventDefault();

  const currentTheme = getPreferredTheme();
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme, true);
}

function initThemeToggle()
{
  setTheme(getPreferredTheme(), false);

  document.addEventListener("click", handleThemeToggleClick);
  document.addEventListener("mpl:templates-loaded", () =>
  {
    const activeTheme = getPreferredTheme();
    syncThemeToggles(activeTheme);
    syncNavbarTheme(activeTheme);
  });
}

if (document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
}
else
{
  initThemeToggle();
}
