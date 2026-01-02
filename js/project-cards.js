// Makes entire project cards clickable while allowing inner links to work.
// Example: add data-href="/solar-system/" on the card and data-ignore-card-click on the GitHub icon link.
function initProjectCards()
{
  const cards = document.querySelectorAll(".project-card[data-href]");
  if (!cards.length)
  {
    return false;
  }

  const shouldIgnoreClick = (_event) =>
  {
    return Boolean(_event.target.closest("[data-ignore-card-click]"));
  };

  const navigateToCard = (_card) =>
  {
    const href = _card.dataset.href;
    if (href)
    {
      window.location.href = href;
    }
  };

  cards.forEach((_card) =>
  {
    _card.addEventListener("click", (_event) =>
    {
      if (shouldIgnoreClick(_event))
      {
        return;
      }

      navigateToCard(_card);
    });

    _card.addEventListener("keydown", (_event) =>
    {
      if (shouldIgnoreClick(_event))
      {
        return;
      }

      if (_event.key === "Enter" || _event.key === " ")
      {
        _event.preventDefault();
        navigateToCard(_card);
      }
    });
  });

  return true;
}


function initProjectThumbFallbacks()
{
  const thumbs = document.querySelectorAll("img.project-thumb");
  if (!thumbs.length)
  {
    return false;
  }

  const replaceWithPlaceholder = (_img) =>
  {
    const placeholder = document.createElement("div");
    placeholder.className = "project-thumb project-thumb--placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    _img.replaceWith(placeholder);
  };

  thumbs.forEach((_img) =>
  {
    if (_img.dataset.thumbFallbackAttached)
    {
      return;
    }

    _img.dataset.thumbFallbackAttached = "true";
    _img.addEventListener("error", () =>
    {
      replaceWithPlaceholder(_img);
    }, { once: true });
  });

  return true;
}

function initProjectCardsWhenReady()
{
  let cardsReady = false;
  let thumbsReady = false;

  const tryInit = () =>
  {
    if (!cardsReady)
    {
      cardsReady = initProjectCards();
    }

    if (!thumbsReady)
    {
      thumbsReady = initProjectThumbFallbacks();
    }

    return cardsReady && thumbsReady;
  };

  if (tryInit())
  {
    return;
  }

  let attempts = 0;
  const timer = setInterval(() =>
  {
    attempts += 1;
    if (tryInit() || attempts >= 10)
    {
      clearInterval(timer);
    }
  }, 250);
}

document.addEventListener("DOMContentLoaded", initProjectCardsWhenReady);