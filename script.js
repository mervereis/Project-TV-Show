//You can edit ALL of the code here
let allEpisodes = [];
function setup() {
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => response.json())
    .then((episodeList) => {
      allEpisodes = episodeList;
      makePageForEpisodes(allEpisodes);
      setupSearch();
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
      document.getElementById("root").textContent =
        "Error loading episodes. Please try again later.";
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
        <h2 class="cardHeader">${episode.name} - ${formatEpisodeCode(episode.season, episode.number)}</h2>
        <img src="${episode.image?.medium || ""}" alt="${episode.name}" />
        <p class="summary">${episode.summary}</p>
      </article>
    `;
    })
    .join("");

  document.getElementById("episodeCount").textContent =
    `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;
}
function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        (episode.summary || "").toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);

    document.getElementById("episodeCount").textContent =
      `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
  });
}
window.onload = setup;
