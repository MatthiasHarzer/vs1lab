// File origin: VS1LAB A3

const GeoTag = require("./geotag");

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 *
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 *
 * Provide a method 'addGeoTag' to add a geotag to the store.
 *
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 *
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 *
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields.
 */
class InMemoryGeoTagStore {
  #proximityDistance = 1; // +/-1 degree of each coordinate
  /**
   * @type {GeoTag[]}
   */
  #tags = [];

  /**
   * @param {GeoTag} geoTag
   */
  addGeoTag(geoTag) {
    this.#tags.push(geoTag);
  }

  /**
   * @param {string} name
   */
  removeGeoTag(name) {
    const idx = this.#tags.findIndex((tag) => tag.name === name);
    if (idx < 0) return;
    this.#tags.splice(idx, 1);
  }

  /**
   * @param {number} latitude
   * @param {number} longitude
   * @returns {GeoTag[]}
   */
  getNearbyGeoTags(latitude, longitude) {
    return this.#tags.filter((tag) => {
      const latDiff = Math.abs(tag.location.latitude - latitude);
      const lonDiff = Math.abs(tag.location.longitude - longitude);
      return (
        latDiff <= this.#proximityDistance && lonDiff < this.#proximityDistance
      );
    });
  }

  /**
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} searchTerm
   * @returns {GeoTag[]}
   */
  searchNearbyGeoTags(latitude, longitude, searchTerm) {
    const nearbyGeoTags = this.getNearbyGeoTags(latitude, longitude);
    searchTerm = searchTerm.toLocaleLowerCase();

    return nearbyGeoTags.filter(
      (tag) =>
        tag.name.toLocaleLowerCase().includes(searchTerm) ||
        tag.hashtag.toLocaleLowerCase().includes(searchTerm)
    );
  }
}

module.exports = InMemoryGeoTagStore;
