// Renders a small Bluesky author feed using the public API.
// Tuning: set data-bsky-handle and data-bsky-limit on #bsky-feed in index.html.
function initBlueskyFeed()
{
  const feed = document.getElementById("bsky-feed");
  if (!feed)
  {
    return;
  }

  const fallback = document.querySelector(".home-feed-fallback");
  const handle = feed.dataset.bskyHandle || "marinsplaylab.org";
  const limit = Number.parseInt(feed.dataset.bskyLimit || "3", 10);
  const apiUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=25`;

  const escapeHtml = (_value) =>
  {
    return String(_value).replace(/[&<>"]/g, (char) =>
    {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  };

  const formatText = (_text) =>
  {
    const safe = escapeHtml(_text || "");
    return safe.replace(/\n/g, "<br>");
  };

  const formatDate = (_value) =>
  {
    if (!_value)
    {
      return "";
    }

    const date = new Date(_value);
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

  const normalizeEmbed = (_embed) =>
  {
    if (!_embed)
    {
      return null;
    }

    if (_embed.$type === "app.bsky.embed.recordWithMedia#view")
    {
      return _embed.media || null;
    }

    return _embed;
  };

  const hideFallback = () =>
  {
    if (fallback)
    {
      fallback.classList.add("is-hidden");
    }
  };

  const showMessage = (_message) =>
  {
    feed.innerHTML = `<p class="home-feed-empty">${escapeHtml(_message)}</p>`;
  };

  fetch(apiUrl)
    .then((response) =>
    {
      if (!response.ok)
      {
        throw new Error(`Bluesky feed error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) =>
    {
      const items = (data.feed || [])
        .filter((entry) => !entry.reason && !entry.post?.record?.reply)
        .slice(0, Number.isFinite(limit) ? Math.max(1, limit) : 3);

      if (!items.length)
      {
        showMessage("No updates available yet.");
        return;
      }

      feed.innerHTML = items.map((entry) =>
      {
        const uri = entry.post?.uri || "";
        const rkey = uri.split("/").pop();
        const url = `https://bsky.app/profile/${handle}/post/${rkey}`;
        const text = formatText(entry.post?.record?.text || "");
        const date = formatDate(entry.post?.record?.createdAt);
        const embed = normalizeEmbed(entry.post?.embed);
        let mediaHtml = "";

        if (embed?.$type === "app.bsky.embed.images#view")
        {
          const images = (embed.images || []).slice(0, 4).map((image) =>
          {
            const thumb = image.thumb || image.fullsize;
            const full = image.fullsize || image.thumb;
            if (!thumb || !full)
            {
              return "";
            }

            return `
              <a class="home-feed-media-link" href="${full}" target="_blank" rel="noopener noreferrer">
                <img class="home-feed-media-image" src="${thumb}" alt="${escapeHtml(image.alt || "")}" loading="lazy" decoding="async">
              </a>
            `;
          }).join("");

          if (images)
          {
            mediaHtml = `<div class="home-feed-media home-feed-media-grid">${images}</div>`;
          }
        }

        if (embed?.$type === "app.bsky.embed.video#view" && embed.playlist)
        {
          const poster = embed.thumbnail ? ` poster="${embed.thumbnail}"` : "";
          mediaHtml = `
            <div class="home-feed-media">
              <video class="home-feed-media-video" controls playsinline preload="metadata"${poster}>
                <source src="${embed.playlist}" type="application/x-mpegURL">
                <a href="${url}" target="_blank" rel="noopener noreferrer">Watch on Bluesky</a>
              </video>
            </div>
          `;
        }

        return `
          <article class="home-feed-item">
            <p class="home-feed-text">${text || "(no text)"}</p>
            ${date ? `<div class="home-feed-meta">${escapeHtml(date)}</div>` : ""}
            ${mediaHtml}
            <a class="home-feed-link" href="${url}" target="_blank" rel="noopener noreferrer">View on Bluesky</a>
          </article>
        `;
      }).join("");

      hideFallback();
    })
    .catch(() =>
    {
      showMessage("Unable to load updates right now.");
    });
}

document.addEventListener("DOMContentLoaded", initBlueskyFeed);
