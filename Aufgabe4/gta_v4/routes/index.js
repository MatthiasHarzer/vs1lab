// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require("express");
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore.
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require("../models/geotag");

/**
 * The module "geotag-store" exports a class GeoTagStore.
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require("../models/geotag-store");
const GeoTagExamples = require("../models/geotag-examples");

const db = new GeoTagStore();
for (const [name, lat, lon, hashtag] of GeoTagExamples.tagList) {
  db.addGeoTag(name, lat, lon, hashtag);
}

const pageSize = 4;
// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get("/", (req, res) => {
  res.render("./index", {});
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JrsSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */
router.get("/api/geotags", (req, res) => {
  const { searchterm, latitude, longitude, lastSeen } = req.query;

  let tags;
  if (latitude !== undefined && longitude !== undefined) {
    tags = db.getNearbyGeoTags(latitude, longitude);
  } else {
    tags = db.getGeoTags();
  }

  if (searchterm) {
    tags = tags.filter(
      (tag) =>
        tag.name.toLocaleLowerCase().includes(searchterm.toLowerCase()) ||
        tag.hashtag.toLocaleLowerCase().includes(searchterm.toLowerCase())
    );
  }

  if (tags.length === 0) {
    res.send({
      tags: [],
      hasNext: false,
      hastPrev: false,
      totalTags: 0,
      page: 0,
      totalPages: 0,
    });
    return;
  }

  let paginatedTags;

  const lastSeenIndex = tags.findIndex((tag) => tag.id === parseInt(lastSeen));
  if (lastSeenIndex !== -1) {
    paginatedTags = tags.slice(lastSeenIndex + 1, lastSeenIndex + 1 + pageSize);
  } else {
    paginatedTags = tags.slice(0, pageSize);
  }

  const lastTagIndex = tags.length - 1;
  const hasNext =
    paginatedTags[paginatedTags.length - 1] !== tags[lastTagIndex];
  const hastPrev = tags[0] !== paginatedTags[0];
  const page = Math.floor(lastSeenIndex / pageSize);

  res.send({
    tags: paginatedTags,
    hasNext,
    hastPrev,
    totalTags: tags.length,
    page,
    totalPages: Math.ceil(tags.length / pageSize),
    request: {
      latitude,
      longitude,
      searchterm,
    },
  });
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post("/api/geotags", (req, res) => {
  const { name, longitude, latitude, hashtag } = req.body;

  const newTag = db.addGeoTag(name, latitude, longitude, hashtag);
  res.send(newTag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get("/api/geotags/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const tag = db.getGeoTag(id);

  res.send(tag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response.
 */

router.put("/api/geotags/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const tag = db.getGeoTag(id);

  const { name, longitude, latitude, hashtag } = req.body;

  if (tag) {
    tag.hashtag = hashtag;
    tag.name = name;
    tag.location.longitude = longitude;
    tag.location.latitude = latitude;
  }

  res.send(tag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete("/api/geotags/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = db.removeGeoTag(id);
  res.send(deleted);
});

module.exports = router;
