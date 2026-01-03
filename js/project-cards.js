// Makes entire project cards clickable while allowing inner links to work.
// Example: add data-href="/solar-system/" on the card and data-ignore-card-click on the GitHub icon link.
function initProjectCards()
{
  const projectCards = document.querySelectorAll(".project-card[data-href]");
  if (!projectCards.length)
  {
    return false;
  }

  const shouldIgnoreClick = (event) =>
  {
    return Boolean(event.target.closest("[data-ignore-card-click]"));
  };

  const navigateToCard = (card) =>
  {
    const href = card.dataset.href;
    if (href)
    {
      window.location.href = href;
    }
  };

  projectCards.forEach((card) =>
  {
    card.addEventListener("click", (event) =>
    {
      if (shouldIgnoreClick(event))
      {
        return;
      }

      navigateToCard(card);
    });

    card.addEventListener("keydown", (event) =>
    {
      if (shouldIgnoreClick(event))
      {
        return;
      }

      if (event.key === "Enter" || event.key === " ")
      {
        event.preventDefault();
        navigateToCard(card);
      }
    });
  });

  return true;
}


function initProjectThumbFallbacks()
{
  const thumbnailImages = document.querySelectorAll("img.project-thumb");
  if (!thumbnailImages.length)
  {
    return false;
  }

  const replaceWithPlaceholder = (imageElement) =>
  {
    const placeholder = document.createElement("div");
    placeholder.className = "project-thumb project-thumb--placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    imageElement.replaceWith(placeholder);
  };

  thumbnailImages.forEach((imageElement) =>
  {
    if (imageElement.dataset.thumbFallbackAttached)
    {
      return;
    }

    imageElement.dataset.thumbFallbackAttached = "true";
    imageElement.addEventListener("error", () =>
    {
      replaceWithPlaceholder(imageElement);
    }, { once: true });
  });

  return true;
}

function initProjectCardsWhenReady()
{
  let cardsInitialized = false;
  let thumbnailsInitialized = false;

  const tryInitialize = () =>
  {
    if (!cardsInitialized)
    {
      cardsInitialized = initProjectCards();
    }

    if (!thumbnailsInitialized)
    {
      thumbnailsInitialized = initProjectThumbFallbacks();
    }

    return cardsInitialized && thumbnailsInitialized;
  };

  if (tryInitialize())
  {
    return;
  }

  let attempts = 0;
  const timer = setInterval(() =>
  {
    attempts += 1;
    if (tryInitialize() || attempts >= 10)
    {
      clearInterval(timer);
    }
  }, 250);
}

document.addEventListener("DOMContentLoaded", initProjectCardsWhenReady);
