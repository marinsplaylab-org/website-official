// Toggles a fallback message and keeps the X timeline height responsive.
// Height tuning lives on the .twitter-timeline element:
// data-height-min (px), data-height-max (px), data-height-scale (viewport multiplier).
// Example: scale 0.6 makes the timeline shorter on small screens; max 760 caps tall monitors.
function initXEmbed()
{
  const card = document.querySelector(".home-feed-card");
  if (!card)
  {
    return;
  }

  const timeline = card.querySelector(".twitter-timeline");
  if (!timeline)
  {
    return;
  }

  const fallback = card.querySelector(".home-feed-fallback");
  const hasTimeline = () =>
  {
    return Boolean(card.querySelector("iframe")) || card.querySelector(".twitter-timeline-rendered");
  };

  const hideFallback = () =>
  {
    if (fallback)
    {
      fallback.classList.add("is-hidden");
    }
  };

  const getNumber = (_value, _fallback) =>
  {
    const parsed = Number.parseFloat(_value);
    return Number.isFinite(parsed) ? parsed : _fallback;
  };

  const getTimelineHeight = () =>
  {
    const min = getNumber(timeline.dataset.heightMin, 520);
    const max = getNumber(timeline.dataset.heightMax, 900);
    const scale = getNumber(timeline.dataset.heightScale, 0.78);
    const rawHeight = Math.round(window.innerHeight * scale);
    return Math.min(max, Math.max(min, rawHeight));
  };

  const applyTimelineHeight = () =>
  {
    const height = getTimelineHeight();
    timeline.setAttribute("data-height", `${height}`);

    const iframe = card.querySelector("iframe");
    if (iframe)
    {
      iframe.style.height = `${height}px`;
    }
  };

  const handleLoaded = () =>
  {
    if (!hasTimeline())
    {
      return false;
    }

    hideFallback();
    applyTimelineHeight();
    return true;
  };

  applyTimelineHeight();

  if (handleLoaded())
  {
    return;
  }

  let attempts = 0;
  const timer = setInterval(() =>
  {
    attempts += 1;
    if (handleLoaded())
    {
      clearInterval(timer);
      return;
    }

    if (attempts >= 12)
    {
      clearInterval(timer);
    }
  }, 500);

  let resizeTimer = null;
  window.addEventListener("resize", () =>
  {
    if (resizeTimer)
    {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() =>
    {
      applyTimelineHeight();
    }, 150);
  });
}

document.addEventListener("DOMContentLoaded", initXEmbed);