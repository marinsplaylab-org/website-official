// Initializes a Unity WebGL instance using data-unity-* attributes on a container.
// Required: data-unity-data-url, data-unity-framework-url, data-unity-code-url, data-unity-loader-url.
// Example: if your build outputs SpaceLab.data.br, set data-unity-data-url="SpaceLab.data.br".
function loadUnity(_rootId)
{
  const root = document.getElementById(_rootId);
  if (!root)
  {
    console.error(`Missing Unity root: ${_rootId}`);
    return;
  }

  const canvas = root.querySelector("[data-unity-canvas]");
  const loading = root.querySelector("[data-unity-loading]");
  const loadingText = loading ? loading.querySelector("[data-unity-loading-text]") : null;
  const warning = root.querySelector("[data-unity-warning]");
  const dataUrl = root.dataset.unityDataUrl;
  const frameworkUrl = root.dataset.unityFrameworkUrl;
  const codeUrl = root.dataset.unityCodeUrl;
  const loaderUrl = root.dataset.unityLoaderUrl;
  // Optional values: productName/productVersion update the loading text only.
  const streamingAssetsUrl = root.dataset.unityStreamingAssetsUrl || "StreamingAssets";
  const productName = root.dataset.unityProductName || "Unity Project";
  const companyName = root.dataset.unityCompanyName || "Marins PlayLab";
  const productVersion = root.dataset.unityProductVersion || "0.1";
  const showBanner = root.dataset.unityShowBanner === "true";
  const rawArgs = root.dataset.unityArguments || "";
  let args = [];

  if (rawArgs)
  {
    // If JSON parsing fails, fall back to comma-separated values.
    try
    {
      args = JSON.parse(rawArgs);
    }
    catch
    {
      args = rawArgs.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }

  if (!canvas || !dataUrl || !frameworkUrl || !codeUrl || !loaderUrl)
  {
    console.error("Unity loader is missing required data attributes.");
    return;
  }

  const showBannerMessage = (msg, type) =>
  {
    if (!warning)
    {
      console.warn(msg);
      return;
    }

    function updateBannerVisibility()
    {
      warning.style.display = warning.children.length ? "block" : "none";
    }

    const div = document.createElement("div");
    div.textContent = msg;
    warning.appendChild(div);

    if (type === "error")
    {
      div.style = "background: #ef4444; padding: 10px; color: #0b0b0b;";
    }
    else if (type === "warning")
    {
      div.style = "background: #facc15; padding: 10px; color: #0b0b0b;";
      setTimeout(() =>
      {
        if (warning.contains(div))
        {
          warning.removeChild(div);
          updateBannerVisibility();
        }
      }, 5000);
    }

    updateBannerVisibility();
  };

  const config =
  {
    arguments: args,
    dataUrl,
    frameworkUrl,
    codeUrl,
    streamingAssetsUrl,
    companyName,
    productName,
    productVersion
  };

  if (showBanner)
  {
    config.showBanner = showBannerMessage;
  }

  const loaderScript = document.createElement("script");
  loaderScript.src = loaderUrl;
  loaderScript.onload = () =>
  {
    // createUnityInstance is provided by the Unity loader script.
    createUnityInstance(canvas, config, (progress) =>
    {
      if (loadingText)
      {
        loadingText.textContent = `Loading ${productName}... ${Math.round(progress * 100)}%`;
      }
      else if (loading)
      {
        loading.textContent = `Loading ${productName}... ${Math.round(progress * 100)}%`;
      }
    }).then(() =>
    {
      if (loading)
      {
        loading.classList.add("is-hidden");
      }
    }).catch((message) =>
    {
      console.error(message);
      if (loadingText)
      {
        loadingText.textContent = "Failed to load the project. Please try again later. Check your connection or refresh.";
      }
      else if (loading)
      {
        loading.textContent = "Failed to load the project. Please try again later. Check your connection or refresh.";
      }
    });
  };

  document.body.appendChild(loaderScript);
}