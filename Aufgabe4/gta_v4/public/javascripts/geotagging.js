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
  let lastPage = 0;
  let disableInput = false;
  const { latitude, longitude } = await LocationHelper.findLocation();
  let tagData = await getGeoTags();
  updateDiscovery(tagData);

  /**
   * @param {GeoTagsResponse} tagData
   */
  function buildPage(tagData) {
    const { tags, hasNext, hastPrev, page, totalPages, totalTags } = tagData;

    if (tags.length === 0) {
      return document.createElement("div");
    }

    const wrapperElement = document.createElement("div");
    wrapperElement.classList.add("page-wrapper");
    wrapperElement.id = "pageWrapper";

    const animationWrapper = document.createElement("div");
    animationWrapper.classList.add("animation-wrapper");
    animationWrapper.id = "animationWrapper";

    for (const tag of tags) {
      const tagElement = document.createElement("li");
      tagElement.textContent = `${tag.name} (${tag.location.latitude}, ${tag.location.longitude}) ${tag.hashtag}`;
      animationWrapper.appendChild(tagElement);
    }

    const paginationElement = document.createElement("div");
    paginationElement.classList.add("pagination");

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.disabled = !hastPrev;

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.disabled = !hasNext;

    const pageElement = document.createElement("span");
    pageElement.textContent = `Page ${page} of ${totalPages} (${totalTags})`;

    paginationElement.appendChild(prevButton);
    paginationElement.appendChild(pageElement);
    paginationElement.appendChild(nextButton);

    wrapperElement.appendChild(paginationElement);
    wrapperElement.appendChild(animationWrapper);

    prevButton.onclick = async () => {
      if (disableInput) return;
      tagData = await getGeoTags(tagData.page - 1, tagData.request.searchterm);
      updateDiscovery(tagData);
    };
    nextButton.onclick = async () => {
      if (disableInput) return;
      tagData = await getGeoTags(tagData.page + 1, tagData.request.searchterm);
      updateDiscovery(tagData);
    };

    return wrapperElement;
  }

  /**
   *
   * @param {HTMLElement} pageElement
   * @param {'left' | 'right'} direction
   * @returns
   */
  function animateToPage(pageElement, direction) {
    const pageWrapper = document.getElementById("pageWrapper");
    const animationWrapper = document.getElementById("animationWrapper");
    const pagination = document.querySelector(".pagination");

    if (!animationWrapper || !pageWrapper) {
      discoveryResults.innerHTML = "";
      discoveryResults.appendChild(pageElement);
      return;
    }
    pagination.style.visibility = "hidden";
    animationWrapper.id = undefined;
    discoveryResults.appendChild(pageElement);

    const pageAnimationWrapper =
      pageElement.querySelector(".animation-wrapper");

    animationWrapper.style.animationName = `page-animation-out-${direction}`;
    pageAnimationWrapper.style.animationName = `page-animation-in-${direction}`;

    return new Promise((resolve) => {
      animationWrapper.addEventListener("animationend", () => {
        pageWrapper.remove();
        resolve();
      });
    });
  }

  /**
   * @param {GeoTagsResponse} tagData
   * @param {boolean} [noAnimation=false]
   */
  async function updateDiscovery(tagData, noAnimation = false) {
    const { tags } = tagData;
    mapManager.initMap(latitude, longitude);
    mapManager.updateMarkers(latitude, longitude, tags);

    if (tags.length === 0) {
      return;
    }

    const animatonDirection = tagData.page < lastPage ? "left" : "right";

    const page = buildPage(tagData);

    if (noAnimation) {
      discoveryResults.innerHTML = "";
      discoveryResults.appendChild(page);
    } else {
      disableInput = true;
      await animateToPage(page, animatonDirection);
      disableInput = false;
    }

    lastPage = tagData.page;
  }

  /**
   *
   * @param {number} page
   * @returns {Promise<GeoTagsResponse>}
   */
  async function getGeoTags(page, searchterm = "") {
    const response = await fetch(
      "/api/geotags?" +
        new URLSearchParams({
          latitude,
          longitude,
          searchterm,
          page,
        })
    );

    return response.json();
  }

  submitGeoTagForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameElement.value;
    const hashtag = hashtagElement.value;

    const response = await fetch("/api/geotags", {
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
    });
    const newTag = await response.json();
    tagData = await getGeoTags();
    updateDiscovery(tagData, true);
  });
  submitDiscoveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    tagData = await getGeoTags(null, discoverySearch.value);
    updateDiscovery(tagData);
  });
});
