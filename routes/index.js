/**
 * @module routes/index
 * This files contains the API for the application, and all the defined routes
 * @author ruwanidealwis
 */

const express = require('express');
const path = require('path');
/** @global stores databasetable */ const databaseTable = require('../controllers/databaseController');
const spotifyController = require('../controllers/spotifyController');
const utils = require('../utils/utils');

// inital express user and URLs
const router = express.Router();
let clientURL = process.env.CLIENTURL;

// url to run app locally
if (clientURL === null) clientURL = 'http://localhost:3000'; // need to change...(for later)

/** ************* API ROUTES  ****************ds */

/**
 * Entry point of the application
 * @name get/
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', (req, res) => {
  // user will pick two years (or their music to compare from this page)
  res.json({
    status: 'success',
    message: 'Welcome to Music Through The Decades',
  });
});

/**
 * Creates a spotify playlist for the user based on the reccomendations
 * returns 201 (created) if successful, or 400 if there is an error
 * @name post/music/createPlaylist
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */

router.post('/music/createPlaylist', (req, res) => {
  spotifyController.createPlaylist(req).then((url) => {
    res.status(201).send({ url });
  }, (err) => {
    res.send(400).send({ error: err });
  });
});

router.get('/music', (req, res) => {
  // logic from :https://github.com/finallyayo/music-history/blob/master/server.js
  // res.redirect(`${clientURL}/?authorized=true`);
  res.status(200).json({
    decade: req.session.decadeStats,
    comparator: req.session.comparator,
  });
});

/**
 * User authorizes the app to use its information (done by Spotify)
 * Method is only called if the user would like to compare their own data!
 * sends 200 (ok) if successful, or 400 if there is an error, and redirects to /callback
 * Authorization defined by the Spotify API: https://developer.spotify.com/documentation/general/guides/authorization-guide/
 * @name get/authorize
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */

router.get('/authorize', (req, res) => {
  const url = spotifyController.getAuthorizationURL(req);
  res.status(200).send({ url }); // now redirects user to authorization (handled by Spotify)...
});

/**
 * After app is authorized, redirected to this route
 * redirects to main route when successful, or 400 if there is an error, and redirects to /callback
 * @name get/callback
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/callback', async (req, res) => {
  res.redirect(`${clientURL}/?authorized=true&code=${req.query.code}`);
});

/**
 * Gets song information for a decade
 * if the information is not in the database, it calls the Spotify API to get the information
 * @name get/decadateData:decade'
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/decadateData', async (req, res) => {
  const { decade } = req.query;
  // TODO validate decade is a valid decade in the list of possible decades

  req.session.decadeStats = await spotifyController.getMusicInformation(
    req,
    decade,
  );

  res.send(200);
});

router.get('/compare/:comparators', async (req, res) => {
  const userSpotify = ['allTime', '6Months', '1Month'];

  // session vars
  req.session.token = '';
  req.session.myTopHits = [];
  req.session.top100Hits = [];
  req.session.fullInfoHitArray = [];
  req.session.artistsIdArray = [];
  req.session.songIdArray = [];
  req.session.albumIdArray = [];
  req.session.topArtistIdArray = [];

  await databaseTable.createTempUser(req.session.id);
  const comparators = req.params.comparators.split('-'); // getting properly formatted comparators
  if (userSpotify.includes(comparators[1])) {
    req.session.type = 'user';
    const validated = utils.validateValues(comparators[0]);
    if (validated === true) {
      // eslint-disable-next-line prefer-destructuring
      req.session.decade = comparators[0];

      // eslint-disable-next-line prefer-destructuring
      req.session.userTopRead = comparators[1];
      req.session.decadeStats = await spotifyController.getMusicInformation(
        req,
        req.session.decade,
      );
      res.setHeader('Content-Type', 'application/json');

      res.write('[');
      res.write(`${JSON.stringify({ decade: req.session.decadeStats })},`);
      req.session.comparator = await spotifyController.getUserListeningHabbits(
        req,
        res,
      );

      // res.write(JSON.stringify({ comparator: req.session.comparator }));
      res.write(JSON.stringify({ comparator: req.session.comparator }));
      res.end(']'); // array ending bracket
      // res.status(200).redirect("/music");

      await databaseTable.deleteUserSongsFromDatabase(
        req.session.id,
        req.session.decade,
      );
      await databaseTable.deleteTempUser(req.session.id);
    } else {
      res
        .status(400)
        .send({ error: 'invalid value entered for 1st comparator' });
    }
  } else {
    req.session.decade = comparators[0];
    const validated = utils.validateValues(comparators[0]);
    if (validated === true) {
      req.session.type = 'decade';

      const validateSecondComparator = utils.validateValues(comparators[1]);
      if (validateSecondComparator === true) {
        // get all the data...
        req.session.decadeStats = await spotifyController.getMusicInformation(
          req,
          req.session.decade,
        );
        res.setHeader('Content-Type', 'application/json');
        res.write('[');
        res.write(`${JSON.stringify({ decade: req.session.decadeStats })},`);

        // await databaseTable.deleteSongsFromDB(req.session.decade);
        // await databaseTable.deleteArtistsFromDB(req.session.decade);
        req.session.decade2 = comparators[1];
        req.session.comparator = await spotifyController.getMusicInformation(
          req,
          req.session.decade2,
        );
        res.write(JSON.stringify({ comparator: req.session.comparator }));
        res.end(']');

        // await databaseTable.deleteSongsFromDB(req.session.decade2);
        // await databaseTable.deleteArtistsFromDB(req.session.decade2);

        await databaseTable.deleteUserSongsFromDatabase(
          req.session.id,
          req.session.decade,
        );

        await databaseTable.deleteUserSongsFromDatabase(
          req.session.id,
          req.session.decade2,
        );

        await databaseTable.deleteTempUser(req.session.id);
      } else {
        res
          .status(400)
          .send({ error: 'invalid value entered for 2nd comparator' });
      }
    } else {
      res
        .status(400)
        .send({ error: 'invalid value entered for 1st comparator' });
    }
  }

  /**
   * Handles all other non defined routes
   * @name get/*
   * @function
   * @param {string} path - Express path
   * @param {callback} middleware - Express middleware.
   */
});
router.get('*', () => {
  // taken from: https://stackoverflow.com/questions/16750524/remove-last-directory-in-url
  const rootPath = __dirname.split(path.sep);
  rootPath.pop();

  // res.sendFile(path.join(rootPath.join(path.sep) + "/client/build/index.html"));
});

module.exports = router;
