// File origin: VS1LAB A2
import { MapManager } from "./map-manager.js";
import { LocationHelper } from "./location-helper.js";

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console.
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
/**
 * @type {HTMLInputElement}
 */
const latitudeElement = document.querySelector("#tag-lat");
/**
 * @type {HTMLInputElement}
 */
const longitudeElement = document.querySelector("#tag-lon");
/**
 * @type {HTMLInputElement}
 */
const nameElement = document.querySelector("#tag-name");
/**
 * @type {HTMLInputElement}
 */
const hashtagElement = document.querySelector("#tag-hashtag");
const submitGeoTagForm = document.querySelector("#tag-form");
const submitDiscoveryForm = document.querySelector("#discoveryFilterForm");
const discoverySearch = document.querySelector("#discovery-search");
const discoveryResults = document.querySelector("#discoveryResults");

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", async () => {
  // alert("Please change the script 'geotagging.js'");
  const mapManager = new MapManager();

  function updateDiscovery(latitude, longitude, tags) {
    mapManager.initMap(latitude, longitude);
    mapManager.updateMarkers(latitude, longitude, tags);

    discoveryResults.innerHTML = "";

    for (const tag of tags) {
      const tagElement = document.createElement("li");
      tagElement.textContent = `${tag.name} (${tag.location.latitude}, ${tag.location.longitude}) ${tag.hashtag}`;
      discoveryResults.appendChild(tagElement);
    }
  }

  const { latitude, longitude } = await LocationHelper.findLocation();
  /**
   * @type {Array}
   */
  let tags = await fetch(
    "/api/geotags?" +
      new URLSearchParams({
        latitude,
        longitude,
      })
  ).then((response) => response.json());

  submitGeoTagForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameElement.value;
    const hashtag = hashtagElement.value;

    const newTag = await fetch("/api/geotags", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        latitude,
        longitude,
        hashtag,
      }),
    }).then((response) => response.json());
    tags.push(newTag);
    updateDiscovery(latitude, longitude, tags);
  });
  submitDiscoveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    tags = await fetch(
      "/api/geotags?" +
        new URLSearchParams({
          latitude,
          longitude,
          searchterm: discoverySearch.value,
        })
    ).then((response) => response.json());
    updateDiscovery(latitude, longitude, tags);
  });

  updateDiscovery(latitude, longitude, tags);
});
