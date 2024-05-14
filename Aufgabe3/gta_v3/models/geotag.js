// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/** *
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {
  constructor(name, latitude, longitude, hashtag) {
    /**
     * @type {string}
     */
    this.name = name;
    /**
     * @type {number}
     */
    this.latitude = latitude;
    /**
     * @type {number}
     */
    this.longitude = longitude;
    /**
     * @type {string}
     */
    this.hashtag = hashtag;
  }
}

module.exports = GeoTag;
