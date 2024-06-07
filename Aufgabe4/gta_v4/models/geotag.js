// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */
/**
 * @typedef {Object} Location
 * @property {number} latitude
 * @property {number} longitude
 
 */

/** *
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {
  /**
   * @param {number} id
   * @param {string} name
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} hashtag
   */
  constructor(id, name, latitude, longitude, hashtag) {
    this.id = id;
    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {Location}
     */
    this.location = {
      latitude: latitude,
      longitude: longitude,
    };
    /**
     * @type {string}
     */
    this.hashtag = hashtag;
  }
}

module.exports = GeoTag;
