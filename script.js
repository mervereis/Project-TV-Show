
let allEpisodes = [];
let currentEpisodes = [];
let showsCache = [];
const episodesCache = {};


function setup() {
  renderShowsView();
  loadShows();
}

function renderShowsView() {
  document.getElementById("root").innerHTML = `
    <div id="showsView">
      <header class="site-header">
        <h1 class="site-title">TV Browser</h1>
        <div class="shows-controls">
          <label for="showSearch">
            <span class="label-text">Filtering for</span>
            <input
              type="text"
              id="showSearch"
              placeholder="Search shows…"
              autocomplete="off"
            />
          </label>
          <span id="showCount" class="show-count"></span>
          <select id="showJumpSelect"></select>
        </div>
      </header>

      <main id="showsListing">
        <p class="loading-msg">Loading shows…</p>
      </main>
    </div>
  `;
}

function loadShows() {
  if (showsCache.length > 0) {
    initShowsView(showsCache);
    return;
  }

  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
      showsCache = shows;
      initShowsView(shows);
    })
    .catch(() => {
      document.getElementById("showsListing").innerHTML =
        '<p class="error-msg">Error loading shows. Please try again.</p>';
    });
}

function initShowsView(shows) {
  renderShowsListing(shows);
  populateShowJumpSelect(shows);
  setupShowSearch(shows);
}

function renderShowsListing(shows) {
  const listing = document.getElementById("showsListing");
  if (!listing) return;

  const countEl = document.getElementById("showCount");
  if (countEl) countEl.textContent = `found ${shows.length} shows`;

  if (shows.length === 0) {
    listing.innerHTML = '<p class="no-results">No shows match your search.</p>';
    return;
  }

  listing.innerHTML = shows
    .map(
      (show) => `
    <article class="show-card" data-id="${show.id}">
      <img
        class="show-thumb"
        src="${show.image?.medium || ""}"
        alt="${show.name}"
        onerror="this.style.display='none'"
      />
      <div class="show-body">
        <h2 class="show-name">
          <a href="#" class="show-link" data-id="${show.id}">${show.name}</a>
        </h2>
        <div class="show-summary">${show.summary || "<em>No summary available.</em>"}</div>
      </div>
      <aside class="show-meta">
        <div class="meta-item">
          <span class="meta-label">Rated:</span>
          <span class="meta-value">${show.rating?.average ?? "N/A"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Genres:</span>
          <span class="meta-value">${
            show.genres?.length ? show.genres.join(" | ") : "N/A"
          }</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Status:</span>
          <span class="meta-value">${show.status ?? "N/A"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Runtime:</span>
          <span class="meta-value">${show.runtime ?? "N/A"}</span>
        </div>
      </aside>
    </article>
  `,
    )
    .join("");

 
  listing.querySelectorAll(".show-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const showId = link.dataset.id;
      const show = showsCache.find((s) => String(s.id) === String(showId));
      openEpisodesView(showId, show?.name ?? "");
    });
  });
}

function populateShowJumpSelect(shows) {
  const select = document.getElementById("showJumpSelect");
  if (!select) return;

  select.innerHTML = shows
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");

  select.addEventListener("change", () => {
    const showId = select.value;
    const show = showsCache.find((s) => String(s.id) === String(showId));
    if (showId) openEpisodesView(showId, show?.name ?? "");
  });
}

function setupShowSearch(allShows) {
  const input = document.getElementById("showSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase().trim();
    const filtered = allShows.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.summary || "").toLowerCase().includes(term) ||
        (s.genres || []).some((g) => g.toLowerCase().includes(term)),
    );

    // Sync jump select to filtered list
    const select = document.getElementById("showJumpSelect");
    if (select) {
      select.innerHTML = filtered
        .map((s) => `<option value="${s.id}">${s.name}</option>`)
        .join("");
    }

    renderShowsListing(filtered);
  });
}

function openEpisodesView(showId, showName) {
  document.getElementById("root").innerHTML = `
    <div id="episodesView">
      <header class="site-header">
        <h1 class="site-title">TV Browser</h1>
        <nav class="breadcrumb">
          <a href="#" id="backToShows">← All Shows</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${showName}</span>
        </nav>
        <div class="episodes-controls">
          <label for="searchInput">
            <span class="label-text">Search episodes</span>
            <input
              type="text"
              id="searchInput"
              placeholder="Search episodes…"
              autocomplete="off"
            />
          </label>
          <span id="episodeCount" class="episode-count"></span>
          <select id="episodeSelect"></select>
        </div>
      </header>

      <main id="root-inner">
        <p class="loading-msg">Loading episodes…</p>
      </main>
    </div>
  `;

  document.getElementById("backToShows").addEventListener("click", (e) => {
    e.preventDefault();
    renderShowsView();
    initShowsView(showsCache);
  });

  loadEpisodesForShow(showId);
}

function loadEpisodesForShow(showId) {
  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    currentEpisodes = allEpisodes;
    makePageForEpisodes(currentEpisodes);
    populateEpisodeSelect(currentEpisodes);
    setupSearch();
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => res.json())
    .then((episodes) => {
      episodesCache[showId] = episodes;
      allEpisodes = episodes;
      currentEpisodes = episodes;
      makePageForEpisodes(currentEpisodes);
      populateEpisodeSelect(currentEpisodes);
      setupSearch();
    })
    .catch(() => {
      const inner = document.getElementById("root-inner");
      if (inner) inner.textContent = "Error loading episodes.";
    });
}

function formatEpisodeCode(season, episode) {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root-inner");
  if (!rootElem) return;

  rootElem.innerHTML = episodeList
    .map(
      (episode) => `
    <article class="filmCard">
      <h2 class="cardHeader">
        ${episode.name} - ${formatEpisodeCode(episode.season, episode.number)}
      </h2>
      <img src="${episode.image?.medium || ""}" alt="${episode.name}" />
      <p class="summary">${episode.summary || ""}</p>
    </article>
  `,
    )
    .join("");

  const count = document.getElementById("episodeCount");
  if (count) {
    count.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;
  }
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        (ep.summary || "").toLowerCase().includes(term),
    );
    currentEpisodes = filtered;
    makePageForEpisodes(filtered);
    populateEpisodeSelect(filtered);
  });
}

function populateEpisodeSelect(episodes) {
  const select = document.getElementById("episodeSelect");
  if (!select) return;

  // Remove old listener by replacing node
  const newSelect = select.cloneNode(false);
  select.parentNode.replaceChild(newSelect, select);

  newSelect.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    newSelect.appendChild(option);
  });

  newSelect.addEventListener("change", () => {
    if (newSelect.value === "") {
      makePageForEpisodes(currentEpisodes);
    } else {
      const selected = currentEpisodes.find(
        (ep) => String(ep.id) === newSelect.value,
      );
      if (selected) makePageForEpisodes([selected]);
    }
  });
}

window.onload = setup;
