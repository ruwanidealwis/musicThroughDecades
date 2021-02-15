/**
 * @module routes/index
 * This files contains the API for the application, and all the defined routes
 * @author ruwanidealwis
 */

const express = require('express');
const path = require('path');
const NodeCache = require('node-cache');

/** @global stores databasetable */ const databaseTable = require('../controllers/databaseController');

/** @global chache */ const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const spotifyController = require('../controllers/spotifyController');

// inital express user and URLs
const router = express.Router();
let clientURL = process.env.CLIENTURL;

// url to run app locally
if (clientURL === undefined) clientURL = 'http://localhost:3000'; // need to change...(for later)

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
 * @param {callback} middleware - Express middleware.  catch(e){
    res.send(400).send({ error: e.message });
 */

router.post('/music/createPlaylist', async (req, res) => {
  try {
    const {
      songIDArray, userID, decade, timeLength,
    } = req.body;
    console.log(req.body);
    const url = await spotifyController.createPlaylist(userID, songIDArray, decade, timeLength);
    res.status(201).send({ url });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
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
  try {
    const url = spotifyController.getAuthorizationURL(req);
    res.status(200).send({ url }); // now redirects user to authorization (handled by Spotify)...
  } catch (e) {
    res.send(400).send({ error: e.message });
  }
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
router.get('/decadeData', async (req, res) => {
  const { decade, code } = req.query;
  // initalize session vars
  req.session.top100Hits = [];
  req.session.fullInfoHitArray = [];
  req.session.artistsIDArray = [];
  req.session.songIDArray = [];
  req.session.topArtistIDArray = [];

  req.session.type = 'decade'; // determines how to authorize app

  // check if item is in cache ...
  const data = myCache.get(decade);
  if (data === undefined) {
    if (code !== 'null') { req.session.code = code; req.session.type = 'user'; } // auth code (if user authorization needed)
    // TODO validate decade is a valid decade in the list of possible decades
    console.log(code);
    try {
      req.session.decadeStats = await spotifyController.getDecadeMusic(
        req,
        decade,
      );
      res.status(200).send({ decadeData: req.session.decadeStats });
      myCache.set(decade, req.session.decadeStats, 1000); // cache response for 1000 seconds
    } catch (e) {
      console.error(e);
      res.status(400).send({ error: e.message });
    }
  } else {
    // retrieve from cache
    console.log('in cache!');
    req.session.decadeStats = data;
    res.status(200).send({ decadeData: req.session.decadeStats });
  }
});

/**
 * Gets user's top songs
 * if the information is not in the database, it calls the Spotify API to get the information
 * @name get/userData:'
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/userData', async (req, res) => {
  // TODO validate decade is a valid decade in the list of possible decades

  const { timeLength, code } = req.query;
  req.session.code = code;
  req.session.type = 'user';
  req.session.userTopRead = timeLength;

  // initalize session vars
  req.session.fullInfoHitArray = [];
  req.session.artistsIDArray = [];
  req.session.songIDArray = [];
  req.session.topArtistIDArray = [];
  req.session.myTopHits = [];

  const data = myCache.get(`${req.session.id}${timeLength}`);

  if (data === undefined) {
    try {
      await databaseTable.createTempUser(req.session.id);

      const userData = await spotifyController.getUserListeningHabits(
        req,
        res,
      );
      req.session.compareValue = userData.fullStatsObject;

      const userMusicData = {
        userData: req.session.compareValue,
        averageValue: userData.averageFeatureData,
      };
      myCache.set(`${req.session.id}${timeLength}`, userMusicData, 500); // cache response for 500 seconds
      // user values can't be stored, so they are deleted after relevant information is gathered

      // send all the data
      res.status(200).send({
        userData: req.session.compareValue,
        averageValue: userData.averageFeatureData,
      });
      await databaseTable.deleteUserSongsFromDatabase(
        req.session.id,
        req.session.decade,
      );
      await databaseTable.deleteTempUser(req.session.id);
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  } else {
    // send from cache
    console.log('in cache');
    res.status(200).send(data);
  }
});

/**
 * Gets song reccomendations for specifc user based on decade
 * @name get/userReccomendations
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/userReccomendations', async (req, res) => {
  try {
    const { averageValues, decade } = req.query;
    const averageValueObject = JSON.parse(averageValues);
    const reccomendations = await databaseTable.getUserRecomendations(averageValueObject, decade);
    res.status(200).send({ reccomendations });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

/**
   * Handles all other non defined routes
   * @name get/*
   * @function
   * @param {string} path - Express path
   * @param {callback} middleware - Express middleware.
   */

router.get('*', () => {
  // taken from: https://stackoverflow.com/questions/16750524/remove-last-directory-in-url
  const rootPath = __dirname.split(path.sep);
  rootPath.pop();

  // res.sendFile(path.join(rootPath.join(path.sep) + "/client/build/index.html"));
});

module.exports = router;
