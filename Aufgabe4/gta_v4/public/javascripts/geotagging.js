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

/**
 * @typedef {Object} GeoTagSearchRequest
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} searchterm
 */

/**
 * @typedef {Object} GeoTagsResponse
 * @property {Array} tags
 * @property {boolean} hasNext
 * @property {boolean} hastPrev
 * @property {number} page
 * @property {number} totalPages
 * @property {number} totalTags
 * @property {GeoTagSearchRequest} request
 */

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", async () => {
  // alert("Please change the script 'geotagging.js'");
  const mapManager = new MapManager();
  /**
   * @type {GeoTagsResponse}
   */
  let tagData = {
    tags: [],
    hasNext: false,
    hastPrev: false,
    page: 0,
    totalPages: 0,
    totalTags: 0,
  };

  /**
   *
   * @param {number} latitude
   * @param {number} longitude
   * @param {GeoTagsResponse} tagData
   */
  function updateDiscovery(latitude, longitude, tagData) {
    const { tags, hasNext, hastPrev, page, totalPages, totalTags } = tagData;
    mapManager.initMap(latitude, longitude);
    mapManager.updateMarkers(latitude, longitude, tags);

    discoveryResults.innerHTML = "";

    for (const tag of tags) {
      const tagElement = document.createElement("li");
      tagElement.textContent = `${tag.name} (${tag.location.latitude}, ${tag.location.longitude}) ${tag.hashtag}`;
      discoveryResults.appendChild(tagElement);
    }
  }

  /**
   *
   * @param {number} lastSeen
   * @returns {Promise<GeoTagsResponse>}
   */
  async function getGeoTags(lastSeen) {
    await fetch(
      "/api/geotags?" +
        new URLSearchParams({
          latitude,
          longitude,
          searchterm: discoverySearch.value,
          lastSeen,
        })
    ).then((response) => response.json());
  }

  const { latitude, longitude } = await LocationHelper.findLocation();
  tagData = await getGeoTags();
  updateDiscovery(latitude, longitude, tagData);

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
    tagData.tags.push(newTag);
    updateDiscovery(latitude, longitude, tagData);
  });
  submitDiscoveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    tagData = await getGeoTags();
    updateDiscovery(latitude, longitude, tagData);
  });
});
