import { GOOGLE_MAPS_STATIS_API_KEY } from "./secrets.js";
// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console.
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
 * @callback findLocationCallback
 * @param {LocationHelper} locationHelper
 */

/**
 * A class to help using the HTML5 Geolocation API.
 */
class LocationHelper {
  // Location values for latitude and longitude are private properties to protect them from changes.
  #latitude = "";

  /**
   * Getter method allows read access to privat location property.
   */
  get latitude() {
    return this.#latitude;
  }

  #longitude = "";

  get longitude() {
    return this.#longitude;
  }

  /**
   * The 'findLocation' method requests the current location details through the geolocation API.
   * It is a static method that should be used to obtain an instance of LocationHelper.
   * Throws an exception if the geolocation API is not available.
   * @param {findLocationCallback} callback a function that will be called with a LocationHelper instance as parameter, that has the current location details
   */
  static findLocation(callback) {
    const geoLocationApi = navigator.geolocation;

    if (!geoLocationApi) {
      throw new Error("The GeoLocation API is unavailable.");
    }

    // Call to the HTML5 geolocation API.
    // Takes a first callback function as argument that is called in case of success.
    // Second callback is optional for handling errors.
    // These callbacks are given as arrow function expressions.
    geoLocationApi.getCurrentPosition(
      (location) => {
        // Create and initialize LocationHelper object.
        let helper = new LocationHelper();
        helper.#latitude = location.coords.latitude.toFixed(5);
        helper.#longitude = location.coords.longitude.toFixed(5);
        // Pass the locationHelper object to the callback.
        callback(helper);
      },
      (error) => {
        alert(error.message);
      }
    );
  }
}

/**
 * A class to help using the MapQuest map service.
 */
class MapManager {
  #apiKey = "";

  /**
   * Create a new MapManager instance.
   * @param {string} apiKey Your MapQuest API Key
   */
  constructor(apiKey) {
    this.#apiKey = apiKey;
  }

  /**
   * Generate a MapQuest image URL for the specified parameters.
   * @param {number} latitude The map center latitude
   * @param {number} longitude The map center longitude
   * @param {{latitude, longitude, name}[]} tags The map tags, defaults to just the current location
   * @param {number} zoom The map zoom, defaults to 14
   * @returns {string} URL of generated map
   */
  getMapUrl(latitude, longitude, tags = [], zoom = 14) {
    if (this.#apiKey === "") {
      console.log("No API key provided.");
      return "images/mapview.jpg";
    }

    const tagList = tags.reduce(
      (acc, tag) =>
        `${acc}markers=color:red|label:${tag.name[0]}|${tag.latitude},${tag.longitude}&`,
      ""
    );

    // const mapQuestUrl = `https://www.mapquestapi.com/staticmap/v5/map?key=${
    //   this.#apiKey
    // }&size=600,400&zoom=${zoom}&center=${latitude},${longitude}&locations=${tagList}`;
    const styledUrl =
      "https://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&style=element:geometry%7Ccolor:0xebe3cd&style=element:labels.text.fill%7Ccolor:0x523735&style=element:labels.text.stroke%7Ccolor:0xf5f1e6&style=feature:administrative%7Celement:geometry.stroke%7Ccolor:0xc9b2a6&style=feature:administrative.land_parcel%7Celement:geometry.stroke%7Ccolor:0xdcd2be&style=feature:administrative.land_parcel%7Celement:labels%7Cvisibility:off&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xae9e90&style=feature:landscape.natural%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:poi%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:poi%7Celement:labels%7Cvisibility:off&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x93817c&style=feature:poi.park%7Celement:geometry.fill%7Ccolor:0xa5b076&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x447530&style=feature:road%7Celement:geometry%7Ccolor:0xf5f1e6&style=feature:road.arterial%7Celement:geometry%7Ccolor:0xfdfcf8&style=feature:road.highway%7Celement:geometry%7Ccolor:0xf8c967&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0xe9bc62&style=feature:road.highway.controlled_access%7Celement:geometry%7Ccolor:0xe98d58&style=feature:road.highway.controlled_access%7Celement:geometry.stroke%7Ccolor:0xdb8555&style=feature:road.local%7Celement:labels%7Cvisibility:off&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x806b63&style=feature:transit.line%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:transit.line%7Celement:labels.text.fill%7Ccolor:0x8f7d77&style=feature:transit.line%7Celement:labels.text.stroke%7Ccolor:0xebe3cd&style=feature:transit.station%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:transit.station%7Celement:labels.icon%7Cvisibility:off&style=feature:water%7Celement:geometry.fill%7Ccolor:0xb9d3c2&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x92998d";
    const url = `${styledUrl}&key=${
      this.#apiKey
    }&size=500x400&center=${latitude},${longitude}&zoom=${zoom}&${tagList}`;

    console.log("Generated MapQuest URL:", url);

    return url;
  }
}

/**
 * TODO: 'updateLocation'
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
 * @type {HTMLImageElement}
 */
const mapPreviewElement = document.querySelector("#mapView");

function updateLocation() {
  LocationHelper.findLocation((helper) => {
    latitudeElement.value = helper.latitude;
    longitudeElement.value = helper.longitude;

    const mapManager = new MapManager(GOOGLE_MAPS_STATIS_API_KEY);
    mapPreviewElement.src = mapManager.getMapUrl(
      helper.latitude,
      helper.longitude
    );
  });
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
  // alert("Please change the script 'geotagging.js'");
  updateLocation();
});
