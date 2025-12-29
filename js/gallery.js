function playGalleryVideo(_item)
{
  const video = _item.querySelector(".gallery-media-video");
  if (!video)
  {
    return;
  }

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function")
  {
    playPromise.catch(() =>
    {
      return;
    });
  }
}

function pauseGalleryVideo(_item)
{
  const video = _item.querySelector(".gallery-media-video");
  if (!video)
  {
    return;
  }

  video.pause();
  try
  {
    video.currentTime = 0;
  }
  catch
  {
    return;
  }
}

function initGalleryEvents()
{
  if (window.__galleryEventsBound)
  {
    return;
  }

  window.__galleryEventsBound = true;

  // Event delegation keeps gallery behavior working even when HTML is injected.
  document.addEventListener("click", (event) =>
  {
    const item = event.target.closest(".gallery-item[data-link]");
    if (!item)
    {
      return;
    }

    if (event.target.closest("a"))
    {
      return;
    }

    item.blur();
    window.location.href = item.dataset.link;
  });

  document.addEventListener("keydown", (event) =>
  {
    if (event.key !== "Enter" && event.key !== " ")
    {
      return;
    }

    const item = event.target.closest(".gallery-item[data-link]");
    if (!item || event.target.closest("a"))
    {
      return;
    }

    event.preventDefault();
    item.blur();
    window.location.href = item.dataset.link;
  });

  document.addEventListener("pointerover", (event) =>
  {
    const item = event.target.closest(".gallery-item[data-link]");
    if (!item || (event.relatedTarget && item.contains(event.relatedTarget)))
    {
      return;
    }

    playGalleryVideo(item);
  });

  document.addEventListener("pointerout", (event) =>
  {
    const item = event.target.closest(".gallery-item[data-link]");
    if (!item || (event.relatedTarget && item.contains(event.relatedTarget)))
    {
      return;
    }

    pauseGalleryVideo(item);
  });

  document.addEventListener("focusin", (event) =>
  {
    const item = event.target.closest(".gallery-item[data-link]");
    if (!item)
    {
      return;
    }

    playGalleryVideo(item);
  });

  document.addEventListener("focusout", (event) =>
  {
    const item = event.target.closest(".gallery-item[data-link]");
    if (!item || (event.relatedTarget && item.contains(event.relatedTarget)))
    {
      return;
    }

    pauseGalleryVideo(item);
  });
}

document.addEventListener("DOMContentLoaded", initGalleryEvents);