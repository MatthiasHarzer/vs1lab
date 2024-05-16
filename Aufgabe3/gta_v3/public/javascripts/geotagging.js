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
const mapPreviewElement = document.querySelector("#mapPreview");
const mapPreviewLabelElement = document.querySelector("#mapPreviewLabel");
const hiddenLatitudeElement = document.querySelector("#tag-lat-df");
const hiddenLongitudeElement = document.querySelector("#tag-lon-df");

function updateLocation() {
  LocationHelper.findLocation(({ latitude, longitude }) => {
    latitudeElement.value = latitude;
    longitudeElement.value = longitude;
    hiddenLatitudeElement.value = latitude;
    hiddenLongitudeElement.value = longitude;

    mapPreviewElement.remove();
    mapPreviewLabelElement.remove();

    const mapManager = new MapManager();
    mapManager.initMap(latitude, longitude);
    mapManager.updateMarkers(latitude, longitude);
  });
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
  // alert("Please change the script 'geotagging.js'");
  updateLocation();
});
