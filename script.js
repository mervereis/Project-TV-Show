//You can edit ALL of the code here
function setup() {
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => response.json())
    .then((episodeList) => {
      makePageForEpisodes(episodeList);
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
      document.getElementById("root").textContent =
        "Error loading episodes. Please try again later.";
    });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = episodeList
    .map((episode) => {
      const season = String(episode.season).padStart(2, "0");
      const episodeNumber = String(episode.number).padStart(2, "0");
      return `
      <article class="filmCard">
        <h2 class="cardHeader">${episode.name} - S${season}E${episodeNumber}</h2>
        <img src="${episode.image.medium}" alt="${episode.name}" />
        <p class="summary">${episode.summary}</p>
      </article>
    `;
    })
    .join("");
}

window.onload = setup;
