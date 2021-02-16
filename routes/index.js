/**
 * @module routes/index
 * This files contains the API for the application, and all the defined routes
 * @author ruwanidealwis
 */

const express = require('express');
const path = require('path');
const NodeCache = require('node-cache');
const utils = require('../utils/utils');

/** @global stores databasetable */ const databaseTable = require('../controllers/databaseController');
/** @global spotify controller */const spotifyController = require('../controllers/spotifyController');

/** @global chache */ const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

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
    res.send(400).send({ error: "Something went wrong, please try again later" });
 */

router.post('/music/createPlaylist', async (req, res) => {
  if (!utils.isAuthorized(req)) {
    res.status(401).send({ error: 'Unauthorized. Please allow permissions to view this endpoint.' });
  } else {
    try {
      const {
        songIDArray, userID, decade, timeLength,
      } = req.body;
      const url = await spotifyController.createPlaylist(userID, songIDArray, decade, timeLength);
      res.status(201).send({ url });
    } catch (e) {
      res.status(400).send({ error: 'Something went wrong, please try again later' });
    }
  }
});

/**
 * User authorizes the app by creating a reasource URL
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
    const url = spotifyController.getAuthorizationURL();
    res.status(200).send({ url }); // now redirects user to authorization (handled by Spotify)...
  } catch (e) {
    res.send(400).send({ error: 'Something went wrong, please try again later' });
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
  // TODO send a response with the auth header (access token) and refresh token
  try {
    res.redirect(`${clientURL}/?authorized=true&code=${req.query.code}`);
  } catch (e) {
    res.status(400).send({ error: 'Something went wrong, please try again later' });
  }
});

/**
 * gets the refresh and access tokens for the current user by authorizing WITHIN the app
 * @name get/authTokens
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/authTokens', async (req, res) => {
  try {
    const { refreshToken, accessToken } = await spotifyController.authorizeUser(req.query.code);
    // store the tokens in auth headers so client cn pass them
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.setHeader('refreshToken', refreshToken); // custom token
    res.status(200).send({ status: 'ok' });
  } catch (e) {
    res.status(400).send({ error: 'Something went wrong, please try again later' });
  }
});

/**
 * Gets song information for a decade
 * if the information is not in the database, it calls the Spotify API to get the information
 * @name get/decadateData:decade'
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/decadeData', async (req, res) => {
  const { decade } = req.query;
  if (!utils.validateValues(decade)) {
    res.status(400).send({ error: 'Decade Parameter Invalid.' });
  } else {
    // check if item is in cache ...
    const data = myCache.get(decade);
    if (data === undefined) {
      try {
        const decadeStats = await spotifyController.getDecadeMusic(
          decade,
        );
        res.status(200).send({ decadeData: decadeStats });
        myCache.set(decade, decadeStats, 1000); // cache response for 1000 seconds
      } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Something went wrong, please try again later' });
      }
    } else {
    // retrieve from cache
      console.log('in cache!');
      res.status(200).send({ decadeData: data });
    }
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
  if (!utils.isAuthorized(req)) {
    res.status(401).send({ error: 'Unauthorized. Please allow permissions to view this endpoint.' });
  } else {
    const { timeLength } = req.query;
    const data = myCache.get(`${req.session.id}${timeLength}`);
    const accessToken = req.header('authorization').split(' ')[1];
    const refreshToken = req.header('RefreshToken');
    if (data === undefined) {
      try {
        await databaseTable.createTempUser(req.session.id);

        // eslint-disable-next-line max-len
        const { fullStatsObject, averageFeatureData } = await spotifyController.getUserListeningHabits(
          timeLength,
          req.session.id,
          accessToken,
          refreshToken,
        );

        const userMusicData = {
          userData: fullStatsObject,
          averageValue: averageFeatureData,
        };
        myCache.set(`${req.session.id}${timeLength}`, userMusicData, 500); // cache response for 500 seconds
        // user values can't be stored, so they are deleted after relevant information is gathered

        // send all the data
        res.status(200).send({
          userData: userMusicData.userData,
          averageValue: averageFeatureData,
        });
        await databaseTable.deleteUserSongsFromDatabase(
          req.session.id,
          req.session.decade,
        );
        await databaseTable.deleteTempUser(req.session.id);
      } catch (e) {
        res.status(400).send({ error: 'Something went wrong, please try again later' });
      }
    } else {
      // send from cache
      console.log('in cache');
      res.status(200).send(data);
    }
  }
});

/**
 * Gets song reccomendations for specifc user based on decade
 * @name get/userReccomendations
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/userReccomendations', async (req, res) => {
  if (!utils.isAuthorized(req)) {
    res.status(401).send({ error: 'Unauthorized. Please allow permissions to view this endpoint.' });
  } else {
    try {
      const { averageValues, decade } = req.query;
      const averageValueObject = JSON.parse(averageValues);
      const reccomendations = await databaseTable.getUserRecomendations(averageValueObject, decade);
      res.status(200).send({ reccomendations });
    } catch (e) {
      res.status(400).send({ error: 'Something went wrong, please try again later' });
    }
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
