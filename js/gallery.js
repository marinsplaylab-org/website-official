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

function initGalleryLinks()
{
  const items = document.querySelectorAll(".gallery-item[data-link]");

  items.forEach((item) =>
  {
    const link = item.dataset.link;
    if (!link)
    {
      return;
    }

    item.addEventListener("click", (event) =>
    {
      if (event.target.closest("a"))
      {
        // Keep inner links working without triggering tile navigation.
        return;
      }

      item.blur();
      window.location.href = link;
    });

    item.addEventListener("keydown", (event) =>
    {
      if (event.key === "Enter" || event.key === " ")
      {
        if (event.target.closest("a"))
        {
          return;
        }

        event.preventDefault();
        window.location.href = link;
      }
    });

    item.addEventListener("mouseenter", () =>
    {
      // Hover plays the preview video when allowed by the browser.
      playGalleryVideo(item);
    });

    item.addEventListener("mouseleave", () =>
    {
      pauseGalleryVideo(item);
    });

    item.addEventListener("focusin", () =>
    {
      // Keyboard focus should also preview the video.
      playGalleryVideo(item);
    });

    item.addEventListener("focusout", () =>
    {
      pauseGalleryVideo(item);
    });
  });
}

document.addEventListener("DOMContentLoaded", initGalleryLinks);