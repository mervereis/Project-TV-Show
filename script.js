//You can edit ALL of the code here

let allEpisodes = [];
let currentEpisodes = [];
let showsCache = [];
const episodesCache = {};

function setup() {
  document.getElementById("root").innerHTML = "Loading...";

  setupSearch();
  setupShowSelect();

  loadShows();
}

function loadShows() {
  if (showsCache.length > 0) {
    populateShowSelect(showsCache);
    return;
  }

  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );

      showsCache = shows;
      populateShowSelect(shows);
    })
    .catch(() => {
      document.getElementById("root").textContent = "Error loading shows.";
    });
}

function setupShowSelect() {
  const showSelect = document.getElementById("showSelect");
  if (!showSelect) return; 

  showSelect.addEventListener("change", () => {
    const showId = showSelect.value;
    if (!showId) return;

    loadEpisodesForShow(showId);
  });
}

function populateShowSelect(shows) {
  const showSelect = document.getElementById("showSelect");
  if (!showSelect) return;

  showSelect.innerHTML = `<option value="">Select a show</option>`;

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  if (shows.length > 0) {
    showSelect.value = shows[0].id;
    loadEpisodesForShow(shows[0].id);
  }
}

function loadEpisodesForShow(showId) {
  document.getElementById("root").innerHTML = "Loading episodes...";

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    currentEpisodes = allEpisodes;

    makePageForEpisodes(currentEpisodes);
    populateEpisodeSelect(currentEpisodes);
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
    })
    .catch(() => {
      document.getElementById("root").textContent = "Error loading episodes.";
    });
}

function formatEpisodeCode(season, episode) {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = episodeList
    .map((episode) => {
      return `
      <article class="filmCard">
        <h2 class="cardHeader">
          ${episode.name} - ${formatEpisodeCode(episode.season, episode.number)}
        </h2>

        <img src="${episode.image?.medium || ""}" alt="${episode.name}" />

        <p class="summary">${episode.summary || ""}</p>
      </article>
    `;
    })
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

    const filtered = currentEpisodes.filter((ep) => {
      return (
        ep.name.toLowerCase().includes(term) ||
        (ep.summary || "").toLowerCase().includes(term)
      );
    });

    makePageForEpisodes(filtered);
  });
}

function populateEpisodeSelect(episodes) {
  const select = document.getElementById("episodeSelect");
  if (!select) return;

  select.innerHTML = `<option value="">All Episodes</option>`;

  episodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number,
    )} - ${episode.name}`;

    select.appendChild(option);
  });

  const newSelect = select.cloneNode(true);
  select.parentNode.replaceChild(newSelect, select);

  newSelect.addEventListener("change", () => {
    if (newSelect.value === "") {
      makePageForEpisodes(currentEpisodes);
    } else {
      const selected = currentEpisodes.find((ep) => ep.id == newSelect.value);
      makePageForEpisodes([selected]);
    }
  });
}

window.onload = setup;
