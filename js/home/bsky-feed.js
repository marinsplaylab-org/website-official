// Renders a small Bluesky author feed using the public API.
// Tuning: set data-bsky-handle and data-bsky-limit on #bsky-feed in index.html.
function initBlueskyFeed()
{
  const feedContainer = document.getElementById("bsky-feed");
  if (!feedContainer)
  {
    return;
  }

  const fallbackNote = document.querySelector(".home-feed-fallback");
  const authorHandle = feedContainer.dataset.bskyHandle || "marinsplaylab.org";
  const feedLimit = Number.parseInt(feedContainer.dataset.bskyLimit || "3", 10);
  const apiEndpoint = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(authorHandle)}&limit=25`;
  const cacheKey = "mpl_bsky_cache_v1";
  const backoffKey = "mpl_bsky_backoff_until";
  const cacheTtlMs = 12 * 60 * 60 * 1000;
  const backoffTtlMs = 10 * 60 * 1000;
  const allowedImageHosts = new Set([
    "cdn.bsky.app",
    "video.bsky.app",
    "video.cdn.bsky.app"
  ]);
  const allowedVideoHosts = new Set([
    "video.bsky.app"
  ]);

  const safeUrl = (urlValue, allowedHosts) =>
  {
    if (!urlValue || typeof urlValue !== "string")
    {
      return "";
    }

    try
    {
      const url = new URL(urlValue);
      if (url.protocol !== "https:")
      {
        return "";
      }

      if (allowedHosts && !allowedHosts.has(url.hostname))
      {
        return "";
      }

      return url.href;
    }
    catch
    {
      return "";
    }
  };

  const escapeHtml = (value) =>
  {
    return String(value).replace(/[&<>\"]/g, (char) =>
    {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  };

  const formatText = (text) =>
  {
    const safe = escapeHtml(text || "");
    return safe.replace(/\n/g, "<br>");
  };

  const formatDate = (value) =>
  {
    if (!value)
    {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
    {
      return "";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const normalizeEmbed = (embed) =>
  {
    if (!embed)
    {
      return null;
    }

    if (embed.$type === "app.bsky.embed.recordWithMedia#view")
    {
      return embed.media || null;
    }

    return embed;
  };

  const hideFallback = () =>
  {
    if (fallbackNote)
    {
      fallbackNote.classList.add("is-hidden");
    }
  };

  const showMessage = (message) =>
  {
    feedContainer.innerHTML = `<p class="home-feed-empty">${escapeHtml(message)}</p>`;
  };

  const buildItemsHtml = (feedItems) =>
  {
    return feedItems.map((entry) =>
    {
      const uri = entry.post?.uri || "";
      const recordKey = uri.split("/").pop();
      const postUrl = `https://bsky.app/profile/${authorHandle}/post/${recordKey}`;
      const text = formatText(entry.post?.record?.text || "");
      const date = formatDate(entry.post?.record?.createdAt);
      const embed = normalizeEmbed(entry.post?.embed);
      let mediaHtml = "";

      if (embed?.$type === "app.bsky.embed.images#view")
      {
        const images = (embed.images || []).slice(0, 4).map((image) =>
        {
          const thumb = safeUrl(image.thumb || image.fullsize, allowedImageHosts);
          const full = safeUrl(image.fullsize || image.thumb, allowedImageHosts);
          if (!thumb || !full)
          {
            return "";
          }

          const rawAlt = (image.alt || "").trim();
          const altText = rawAlt || "Bluesky image";
          const ariaLabel = rawAlt ? `Open image: ${rawAlt}` : "Open image on Bluesky";

          return `
          <a class="home-feed-media-link" href="${full}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(ariaLabel)}">
            <img class="home-feed-media-image" src="${thumb}" alt="${escapeHtml(altText)}" loading="lazy" decoding="async">
          </a>
        `;
        }).filter(Boolean).join("");

        if (images)
        {
          mediaHtml = `<div class="home-feed-media home-feed-media-grid">${images}</div>`;
        }
      }

      if (embed?.$type === "app.bsky.embed.video#view" && embed.playlist)
      {
        const playlist = safeUrl(embed.playlist, allowedVideoHosts);
        if (playlist)
        {
          const posterUrl = safeUrl(embed.thumbnail, allowedImageHosts);
          const poster = posterUrl ? ` poster="${posterUrl}"` : "";
          mediaHtml = `
            <div class="home-feed-media">
              <video class="home-feed-media-video" controls playsinline preload="metadata"${poster}>
                <source src="${playlist}" type="application/x-mpegURL">
                <a href="${postUrl}" target="_blank" rel="noopener noreferrer">Watch on Bluesky</a>
              </video>
            </div>
          `;
        }
      }

      return `
        <article class="home-feed-item">
          <p class="home-feed-text">${text || "(no text)"}</p>
          ${date ? `<div class="home-feed-meta">${escapeHtml(date)}</div>` : ""}
          ${mediaHtml}
          <a class="home-feed-link" href="${postUrl}" target="_blank" rel="noopener noreferrer">View on Bluesky</a>
        </article>
      `;
    }).join("");
  };

  const applyFeedHtml = (feedHtml, noteText) =>
  {
    feedContainer.innerHTML = feedHtml;

    if (noteText)
    {
      const noteElement = document.createElement("p");
      noteElement.className = "home-feed-note";
      noteElement.textContent = noteText;
      feedContainer.prepend(noteElement);
    }

    hideFallback();
  };

  const readCache = () =>
  {
    try
    {
      const raw = localStorage.getItem(cacheKey);
      if (!raw)
      {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed?.html || !parsed?.timestamp)
      {
        return null;
      }

      const age = Date.now() - parsed.timestamp;
      return {
        html: parsed.html,
        isFresh: age <= cacheTtlMs
      };
    }
    catch
    {
      return null;
    }
  };

  const writeCache = (feedHtml) =>
  {
    try
    {
      localStorage.setItem(cacheKey, JSON.stringify({
        html: feedHtml,
        timestamp: Date.now()
      }));
    }
    catch
    {
      return;
    }
  };

  const readBackoffUntil = () =>
  {
    try
    {
      const raw = localStorage.getItem(backoffKey);
      const value = raw ? Number.parseInt(raw, 10) : 0;
      return Number.isFinite(value) ? value : 0;
    }
    catch
    {
      return 0;
    }
  };

  const setBackoff = () =>
  {
    try
    {
      localStorage.setItem(backoffKey, String(Date.now() + backoffTtlMs));
    }
    catch
    {
      return;
    }
  };

  const cached = readCache();
  const cachedHtml = cached?.html || "";

  if (cachedHtml && cached.isFresh)
  {
    applyFeedHtml(cachedHtml);
    return;
  }

  const backoffUntil = readBackoffUntil();
  if (backoffUntil && Date.now() < backoffUntil)
  {
    if (cachedHtml)
    {
      applyFeedHtml(cachedHtml, "Updates are temporarily limited. Showing cached posts.");
      return;
    }

    showMessage("Updates are temporarily unavailable.");
    return;
  }

  fetch(apiEndpoint)
    .then((response) =>
    {
      if (!response.ok)
      {
        if (response.status === 429)
        {
          setBackoff();
        }
        throw new Error(`Bluesky feed error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) =>
    {
      const items = (data.feed || [])
        .filter((entry) => !entry.reason && !entry.post?.record?.reply)
        .slice(0, Number.isFinite(feedLimit) ? Math.max(1, feedLimit) : 3);

      if (!items.length)
      {
        showMessage("No updates available yet.");
        return;
      }

      const itemsHtml = buildItemsHtml(items);
      applyFeedHtml(itemsHtml);
      writeCache(itemsHtml);
    })
    .catch(() =>
    {
      if (cachedHtml)
      {
        applyFeedHtml(cachedHtml, "Showing cached updates.");
        return;
      }

      showMessage("Unable to load updates right now.");
    });
}

const scheduleBlueskyFeed = () =>
{
  if ("requestIdleCallback" in window)
  {
    requestIdleCallback(initBlueskyFeed, { timeout: 2000 });
  }
  else
  {
    setTimeout(initBlueskyFeed, 0);
  }
};

if (document.readyState === "loading")
{
  document.addEventListener("DOMContentLoaded", scheduleBlueskyFeed, { once: true });
}
else
{
  scheduleBlueskyFeed();
}
