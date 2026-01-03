// Apply the saved theme before CSS loads to minimize flash.
(() =>
{
  const storageKey = "mpl_theme";
  const root = document.documentElement;
  let theme = "dark";

  try
  {
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark")
    {
      theme = storedTheme;
    }
  }
  catch
  {
    theme = "dark";
  }

  root.setAttribute("data-theme", theme);
  root.setAttribute("data-bs-theme", theme);
})();
