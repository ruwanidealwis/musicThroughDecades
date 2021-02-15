/**
 * File deals with all interactions with the Spotify API
 * @uthor Ruwani De Alwis
 */

/** *********** module imports  ****************************** */
const SpotifyWebApi = require('spotify-web-api-node');
const utils = require('../utils/utils');

/** ******* constiable declaration */
/** @global full array with relevant info of top songs for decade */ const fullInfoHitArray = [];
/** @global user top hits for specific range */ const myTopHits = [];
/** @global client id for app */ const clientID = process.env.CLIENTID;
/** @global instance  of spotify api */let spotifyApi;
/** @global clientSecret of app */ const clientSecret = process.env.CLIENTSECRET;
/** @global redirectUri */ let redirectUri = process.env.CALLBACKURL;
/** @global stores databasetable */ const databaseTable = require('./databaseController');

if (process.env.PORT == null) {
  redirectUri = 'http://localhost:8000/callback';
}

/**
 * @summary Authorizes the app through spotify client credential,
 * only when there does not need to be user authentication
 * @return {void}
 * @throws error if the authorizationf ails
 */
const authorizeApp = async () => {
  try {
    spotifyApi = new SpotifyWebApi({
      clientId: clientID,
      clientSecret,
    });
    const credentials = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(credentials.body.access_token);
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Gets information about the artists (name, genres, image)
 * @param {Array<string>} ids - Array of ids containing the Spotify ID for the artist
 * @return {Array} resolves to array containing information about artists, or error
 * @throws error if external API call fails
 */
const getArtistInfo = async (ids) => {
  const artistArray = [];
  try {
    const artistData = await spotifyApi.getArtists(ids);

    for (const artistObject of artistData.body.artists) {
      let image = '';

      if (artistObject.images[0] != null) image = artistObject.images[0].url;
      const obj = {
        name: artistObject.name,
        genres: artistObject.genres,
        image,
      };
      artistArray.push(obj);
    }
    return artistArray;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Gets audio features for the tracks in the top 100 list using the spotify ids of the songs
 * @summary gets audio features (valence, danceability) etc for the songs
 * @param {Array<string>} songIDArray spotify ids of the songs
 * @return Array resolves to the audio features for the track or the error
 * @throws error if the external API call fails
 */
const getAudioInfo = async (songIDArray) => {
  try {
    const trackAudioFeatures = await spotifyApi.getAudioFeaturesForTracks(songIDArray);
    return trackAudioFeatures.body.audio_features;
  } catch (e) {
    console.error(e);
    throw new Error({ error: e.messaage });
  }
};

/**
 * @summary gets information about the specific songs
 * @param {Array<string>} songIDArray -spotify IDs of the songs
 * @param startIndex allows matching with corresponding array
 * @param {request} req express request object
 * @return {Promise<Array>} array of Track Objects
 * @throws error if there is a problem with API calls
 */
const getBasicSongInfo = async (songIDArray, startIndex, req) => {
  try {
    const returnData = [];
    let i = startIndex;
    const trackDataArray = await spotifyApi.getTracks(songIDArray);

    for (const track of trackDataArray.body.tracks) {
      const songObject = {
        spotifyID: track.id,
        albumID: track.album.id,
        name: track.name.split('-')[0].trim(),
        release: req.session.top100Hits[i].year,
        artists: req.session.top100Hits[i].artists,
        image: track.album.images[0].url,
        popularity: track.popularity,
        previewURL: track.preview_url,
        artistRank: req.session.top100Hits[i].artistRank,
      };
      if (songObject.release === 0) {
        songObject.release = parseInt(track.album.release_date.split('-')[0], 10);
      }
      returnData.push(songObject);
      i += 1;
    }

    return returnData;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * @summary traverses the list of all top 100 songs to get the basic info (artist, year, album) API
 * @param {string} decade the decade being queried
 * @return {Array} Array of objects with full info about the audio features
 * @throws error if any of the external API calls fail
 */
const getSongInformation = async (decade, req) => {
  try {
    const arr = [0, 50, 100, 150, 200];
    let artistInfo = [];

    // gets artist information
    // spotify API allows an array of Artist IDs (can look up 50 artists at once)
    for (const index of arr) {
      if (index > req.session.artistsIDArray.length) {
        break;
      }
      let end = index + 50;
      if (end > req.session.artistsIDArray.length) {
        end = index + (req.session.artistsIDArray.length % 50); // ensure end is not too large
      }

      // slice array to get 0-49, 50-100 etc (to reduce external API calls)
      const partialArtistIDs = req.session.artistsIDArray.slice(index, end);

      // get artist information from the API and concat to gether;
      artistInfo = artistInfo.concat(await getArtistInfo(partialArtistIDs));
    }

    // slice songs, same logic as Artist, reduce external API calls from 100 to 2
    const firstHalf = req.session.songIDArray.slice(0, 50);
    const firstHalfData = await getBasicSongInfo(firstHalf, 0, req);

    const secondHalf = req.session.songIDArray.slice(50, 100);
    const secondHalfData = await getBasicSongInfo(secondHalf, 50, req);

    // join the data
    req.session.fullInfoHitArray = firstHalfData.concat(secondHalfData);

    // get audio features (danceability, valence etc.)
    const audioData = await getAudioInfo(req.session.songIDArray, 3); // await until

    let artistIndex = 0;
    // join all the audio features with the array with the song information
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 100; i++) {
      // alternative ?
      req.session.fullInfoHitArray[i].audioData = audioData[i];

      // this ensures that correct artists are linked with the correct songs
      const length = req.session.fullInfoHitArray[i].artists; // number of artists per song...
      const end = artistIndex + length;
      req.session.fullInfoHitArray[i].artists = [];
      // eslint-disable-next-line no-plusplus
      for (let j = artistIndex; j < end; j++) {
        req.session.fullInfoHitArray[i].artists.push(artistInfo[j]);
      }

      artistIndex = end; // ensures artist data is clean;

      await databaseTable.addSongToDatabase(
        req.session.fullInfoHitArray[i],
        decade,
        i,
      );
    }

    return fullInfoHitArray;
  } catch (e) {
    throw new Error(e);
  }
};

/**
 *
 * @summary adds audio date to users top tracks
 * @param {Request} req - the express request object
 * @returns {void}
 * @throws an error if the API calls fail or if database updates fail
 */

const getUserSongAudioInformation = async (req) => {
  try {
    const returnData = await getAudioInfo(
      req.session.songIDArray,
      req.session.retries,
    ); // await until

    let i = 0;

    for (const songObject of req.session.myTopHits) {
      if (returnData[i] === null) {
        songObject.audioData = null;
      } else {
        songObject.audioData = returnData[i];
      }
      i += 1;

      await databaseTable.addUserSongToDatabase(songObject, i, req.session.id);
    }
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Usess spotify API to get the top tracks for the current user
 * @param {Number} retries - the number of times to retry the API request (if it fails)
 * @param {String} timeRange - specifies the time range to search for top tracks
 * @returns {Array} information about the users top hits
 * @throws error if the API call fails
 */
const getUserTopTracks = async (timeRange, retries, req) => {
  try {
    const userTopTracks = await spotifyApi
      .getMyTopTracks({
        time_range: timeRange,
        limit: 50,
      });

    // iterate through top tracks and get information
    for (const songObject of userTopTracks.body.items) {
      req.session.songIDArray.push(songObject.id); // push to array to get audio features...
      const artistsID = [];
      // get all artists
      songObject.artists.forEach((songArtists) => {
        artistsID.push(songArtists.id);
      });

      const artistInfo = await getArtistInfo(artistsID, retries); // get

      // create object with information
      const object = {
        spotifyID: songObject.id,
        name: songObject.name.replace('-[^-]*$').trim(),

        popularity: songObject.popularity,
        previewURL: songObject.preview_url,
        release: songObject.album.release_date,
        artists: artistInfo,
        imageUrl: songObject.album.images[0].url,
      };
      req.session.myTopHits.push(object); // push it to the array
    }
    return myTopHits;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * @summary  Gets the id for the currently authenticated user
 * @param {Request} req -express req object
 * @returns {String} the id of the current user
 */
const getUserID = async (req) => {
  try {
    const currentUser = await spotifyApi.getMe();

    req.session.userID = currentUser.body.id;
    return currentUser.body.id;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Gets the top artist for the current user based on specified time range
 * @param {String} timeRange - specifies the time range (6 months, all time, 1 month)
 * @return {Array} Array of Object containing information about the users top 10 artists
 * @throws error if the external API call fails
 */
const getUserTopArtists = async (timeRange) => {
  try {
    const topArtists = [];
    const userTopArtists = await spotifyApi
      .getMyTopArtists({
        time_range: timeRange,
        limit: 10,
      });

    for (const ArtistObject of userTopArtists.body.items) {
      topArtists.push({
        name: ArtistObject.name,
        image: ArtistObject.images[0].url,
        genres: ArtistObject.genres,
      });
    }
    return topArtists;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Authorizes the app with user permissions
 * @param {Request} req request object (express)
 * @return {Void} void
 * @throws error if the authorization fails
 */
const authorizeUser = async (req) => {
  try {
    if (
      spotifyApi.getRefreshToken() == null
      || spotifyApi.getAccessToken() !== req.session.token
    ) {
      console.log('setting access token ....');

      const data = await spotifyApi.authorizationCodeGrant(req.session.code);
      req.session.token = data.body.access_token;
      spotifyApi.setAccessToken(data.body.access_token);
      spotifyApi.setRefreshToken(data.body.refresh_token);
    } else {
      console.log('refreshing... access token ....');
      const data = await spotifyApi.refreshAccessToken();

      spotifyApi.setAccessToken(data.body.access_token);
      spotifyApi.setRefreshToken(data.body.refresh_token);
      req.session.token = data.body.access_token;
    }
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Gets music data for a specific decade, if available in the database, returns from db,
 * but makes call to Spotify API if the data is not available
 *  @param {Request} req Express request object
 * @param {string} decade decade being queried
 * @return {Promise<fullInfoHitArray>} --> all relevant data for the application
 * @throws error if any step in getting music fails
 */
exports.getDecadeMusic = async (req, decade) => {
  try {
    // need to run python script and get spotify authentication...
    if (req.session.songIDArray.length !== 0) {
      // reset all data...
      req.session.top100Hits = [];
      req.session.fullInfoHitArray = [];
      req.session.artistsIDArray = [];
      req.session.songIDArray = [];

      req.session.topArtistIDArray = [];
    }
    // checks if data is already in the db
    const dataAvailable = await databaseTable.decadeDataAvailable(decade);

    if (!dataAvailable) {
      // get the data from the spotify API using CSV fiels
      if (req.session.type === 'decade') { await authorizeApp(req); } else {
        await authorizeUser(req);
      }
      await utils.getCSVData(decade, req);
      await getSongInformation(decade, req);
    }

    // gets data from database
    const data = await databaseTable.getDecadeStatistics(decade);

    req.session.top100Hits = [];
    req.session.fullInfoHitArray = [];
    req.session.artistsIDArray = [];
    req.session.songIDArray = [];
    req.session.albumIDArray = [];
    req.session.topArtistIDArray = [];

    // returns all the data
    return data;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * @summary gets the authorization URL for the current user
 * @returns the generated URL
 * @throws error if authorization url general fails
 */
exports.getAuthorizationURL = () => {
  try {
    const state = 'musicthroughdecades'; // change later
    spotifyApi = new SpotifyWebApi({
      clientId: clientID,
      clientSecret,
      redirectUri, // this time we need user to authorize access
    });

    const authorizeURL = spotifyApi.createAuthorizeURL(
      ['user-top-read', 'playlist-modify-private'],
      state,
    ); // generated
    return authorizeURL;
  } catch (e) {
    throw new Error(e);
  }
};

/**
 *
 * @summary gets spotify information of spotify user
 * @param {request} req - express request object
 * @return {Object} Object containing the relevant stats for the users listening habbits
 * @throws error if any external api calls fail
 */
exports.getUserListeningHabits = async (req) => {
  try {
    if (req.session.songIDArray.length !== 0) {
      req.session.myTopHits = [];
      req.session.artistsIDArray = [];
      req.session.songIDArray = [];

      req.session.topArtistIDArray = [];
    }
    await authorizeUser(req);

    // spotifyApi.setAccessToken(data.body.access_token);
    // spotifyApi.setRefreshToken(data.body.refresh_token);
    req.session.userTopRead = utils.getReadChoice(req.session.userTopRead);
    await getUserID(req);
    // await databaseTable.createTempUser(req.session.id); already created

    // gets the top tracks for the user
    await getUserTopTracks(req.session.userTopRead, req.session.retries, req);

    await utils.delay(230); // waits 230ms -- throttles request

    await getUserSongAudioInformation(req); // gets the audio info each of the top hits

    // get user information from db
    const userData = await databaseTable.getUserStatistics(
      req.session.id,
    );

    // get user top artists
    userData.fullStatsObject.topArtists = await getUserTopArtists(req.session.userTopRead);
    userData.fullStatsObject.userID = await getUserID(req);
    return userData;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 *
 * @summary creates a spotify playlist for the user
 * @param {string} userID - spotify users' id
 * @param {Array} songIDArray - list of songs
 * @param {decade} decade - the decade the songs are from
 * @return {string} playlist url
 * @throws error if playlist creation fails
 */
exports.createPlaylist = async (userID, songIDArray, decade, timeLength) => {
  try {
    await spotifyApi.refreshAccessToken();
    const newPlaylist = await spotifyApi.createPlaylist(
      userID,
      `My ${decade}'s recomendations (${timeLength})!`,
      {
        public: false,
        description: 'Made for you by: https://musicthroughdecades.herokuapp.com/',
      },
    );

    const playlistID = newPlaylist.body.id;
    const playlistURL = newPlaylist.body.external_urls.spotify;
    const reccomendationIDArray = [];
    songIDArray.forEach((song) => {
      reccomendationIDArray.push(`spotify:track:${song.spotifyId}`);
    });

    await spotifyApi.addTracksToPlaylist(playlistID, reccomendationIDArray);

    return playlistURL;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};
