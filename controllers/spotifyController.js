/************* module imports  *******************************/
let SpotifyWebApi = require("spotify-web-api-node");
config = require("../variableConfig.js");
var { PythonShell } = require("python-shell");

/********* variable declaration */
/** @global allhitdata */ var top100Hits; //stores 100 hits as retrived from webScraper
/** @global full array with relevant info of top songs for decade */ var fullInfoHitArray = []; //this array contains all the information on the song (audio features etc)
/** @global spotify id's of songs*/ var songIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global user top hits for specific range*/ var myTopHits = []; //spotify id's of the song, enabling to get audio information
/** @global spotify web api wrapper*/ var spotifyApi; //create an instance of webAPI
/** @global clientID of app */ var clientId = process.env.CLIENTID; //client id for app
/** @global clientSecret of app*/ var clientSecret = process.env.CLIENTSECRET; //client secret for app
/** @global redirectUri for spotify user authentication*/ var redirectUri =
  process.env.CALLBACKURL;
/** @global timerange for user top songs*/ var userTopRead = "";
/** @global stores databasetable*/ var databaseTable = require("./databaseController");

/*********************************************** SET BASIC INFO (if running locally...) *********************************/
if (process.env.PORT == null) {
  console.log("local");
  redirectUri = "http://localhost:8000/callback";
}
/**
 * Adds a delay
 * taken from: https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
 * @param {Number} ms - the length of the relay
 * @return {Promise} resolves after the delay
 */

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Gets the time range for the top songs according to what the user wants
 * @param {string} comparator - String that indicates which time range the user wants
 * @return {String} returns time range in format compatible for spotify api query
 */
let getReadChoice = (comparator) => {
  switch (comparator) {
    case "allTime":
      return "long_term";
    case "6Months":
      return "medium_term";
    case "1Month":
      return "short_term";
  }
};

/**
 * runs python script that webscrapes (should ideally only run once) for the top 100 songs of the decade
 *Adapted from :https://www.npmjs.com/package/python-shell
 * @param {Object} req - contains session variable, including the decade to search the top tracks for
 * @return {Promise} returns the data (or error)
 */

let runPy = (req) => {
  return new Promise(function (success, nosuccess) {
    let options = {
      mode: "text",
      pythonPath:
        "/Library/Frameworks/Python.framework/Versions/3.8/bin/python3",
      pythonOptions: ["-u"], // get print results in real-time
      scriptPath:
        "/Users/ruwanidealwis/Downloads/GitHub/musicThroughDecades/webScraperPython", //should update to local path...
      args: [req.session.decade],
    };

    PythonShell.run("./webScraper.py", options, function (err, results) {
      if (err) {
        console.log(err);
        nosuccess(err);
      }
      // results is an array consisting of messages collected during execution
      success(results);
    });
  });
};

/**
 * @summary Authorizes the app through spotify client credential, only when there does not need to be user authentication
 * @return {Promise} returns a promise that resolves to the instance of the spotifyWebAPI (that is a authorized), or returns an error
 */
authorizeApp = async () => {
  return new Promise(function (resolve, reject) {
    spotifyApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
    });
    //adapted from from: https://github.com/thelinmichael/spotify-web-api-node
    spotifyApi.clientCredentialsGrant().then(
      function (data) {
        console.log("The access token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        resolve(spotifyApi);
      },
      function (err) {
        console.log(
          "Something went wrong when retrieving an access token",
          err
        );
        reject(spotifyApi);
      }
    );
  });
};

/**
 * Formats webscraped data
 * @summary Formats webscraped data into an object with specified, track,year, and artist keys
 * @param {array} data - Data scraped from the web
 * @return  {Array} Returns object array with information extracted (track, artists, year)
 */
let formatData = (data) => {
  let dataToModify = data[0];
  console.log(dataToModify);
  let allHitsArray = [];
  let newData = dataToModify.substring(1, data[0].length - 1).split("',");

  console.log(newData);

  newData.forEach((hit) => {
    console.log(hit);
    let artists = [];
    let splitHit = hit.replace("'", "").split(" - ");
    if (splitHit[1] != null) artists = splitHit[1].split("&") || "";
    if (splitHit[2] == null) splitHit[2] = "";
    if (splitHit[3] == null) splitHit[3] = 101;
    //console.log(splitHit[0]);
    allHitsArray.push({
      track: splitHit[0] || hit,
      artist: artists[0],
      year: splitHit[2].replace("'", ""),
      artistRank: parseInt(splitHit[3]),
    }); //because of the way the website is structured (this may not be exactly correc t)
  });

  console.log(allHitsArray);
  return allHitsArray;
};
/**
 * Gets information about the artists (name, genres, image)
 * @param {Array} ids - Array of ids containing the Spotify ID for the artist
 * @return {Promise} resolves to array containing information about artists, or error
 */

var getArtistInfo = async (ids) => {
  let artistArray = [];
  return spotifyApi.getArtists(ids).then(
    (data) => {
      //console.log("Artist information", data.body.artists);
      data.body.artists.forEach((artistObject) => {
        //console.log(artistObject);
        image = "";
        if (artistObject.images[0] != null) image = artistObject.images[0].url;
        let obj = {
          name: artistObject.name,
          genres: artistObject.genres,
          imageURL: image,
        };
        artistArray.push(obj);
      });

      return artistArray;
    },
    async (err) => {
      //taken from:https://github.com/thelinmichael/spotify-web-api-node/issues/217
      if (retries > 0) {
        console.error(e);
        await asyncTimeout(
          e.headers["retry-after"]
            ? parseInt(e.headers["retry-after"]) * 1000
            : RETRY_INTERVAL
        );
        return getArtistInfo(ids, retries - 1);
      }

      return err;
    }
  );
};
/**
 *
 * @summary searches for the track in the spotify database and creates a new object with the aquired data
 * @param {object} trackObject - Object containing the name of the song, the artist, along with the year it was released
 * @return {Promise} that resolves to array with data from spotify API, or the error generated when quereying the API
 */
var getBasicSongInfo = async (trackObject) => {
  return spotifyApi
    .searchTracks((trackObject.track || "") + " " + (trackObject.artist || ""))
    .then(
      function (data) {
        return data.body.tracks.items[0];
      },
      function (err) {
        console.error(err);
        return err;
      }
    )
    .then(
      async (data) => {
        //format array properly...
        if (data == null) {
          let object = {
            id: "",
            albumId: "",
            name: trackObject.track,
            release: trackObject.year,
            image: "",
            artists: [{ name: trackObject.artist, imageURL: "" }],
            popularity: -1,
            artistRank: trackObject.artistRank,
          };
          fullInfoHitArray.push(object);
          songIdArray.push("");
        } else {
          let artistsId = [];
          data.artists.forEach((artist) => {
            artistsId.push(artist.id);
          });
          let artistInfo = await getArtistInfo(artistsId); //get
          await delay(170); //waits 100ms (gets around spotify api rate limiting)
          let object = {
            spotifyId: data.id,
            albumId: data.album.id,
            name: data.name.split("-")[0].trim(), //taken from: https://stackoverflow.com/questions/4292468/javascript-regex-remove-text-between-parentheses
            release: trackObject.year,
            image: data.album.images[0].url,
            artists: artistInfo,
            popularity: data.popularity,
            artistRank: trackObject.artistRank,
          };
          if (object.release == "") {
            object.release = data.album.release_date;
          }
          console.log(data.album.release_date);
          fullInfoHitArray.push(object);
          songIdArray.push(data.id);
        }
        return fullInfoHitArray;
      },
      (error) => {
        return err;
      }
    );
};

/**
 * @summary traverses the list of all top 100 songs to get the basic info for the track using the spotify API
 * @return {Array} Array of objects with full info about the audio features
 */
let getSongInformation = async function () {
  for (const trackObject of top100Hits) {
    //console.log(trackObject);
    await getBasicSongInfo(trackObject);
    //await genreInformation(trackObject); //gets genre of ALBUM!
  } //waits till promise is resolved (this maintains order)
  console.log("done");
  //console.log(fullInfoHitArray);
  return fullInfoHitArray;
};

/**
 * Gets audio features for the tracks in the top 100 list using the spotify ids of the songs
 * @summary traverses the list of all top 100 songs to get the audio features for the track using the spotify API
 * @param {Number} retries - the number of times to retry the API request (if it fails)
 * @return {Promise} resolves to the audio features for the track or the error
 */
let getAudioInfo = async function (retries) {
  return spotifyApi.getAudioFeaturesForTracks(songIdArray).then(
    (data) => {
      console.log(songIdArray);

      return data.body.audio_features;
    },
    async (err) => {
      console.error(err);
      if (retries > 0) {
        console.error(err);
        await asyncTimeout(
          e.headers["retry-after"]
            ? parseInt(e.headers["retry-after"]) * 1000
            : RETRY_INTERVAL
        );
        return getAudioInfo(retries - 1);
      }
      throw err;
    }
  );
};

/**
 *
 * @summary adds keys to objects of the to array of the top songs with the information generated from the audio feature query of the spotify API and then adds them to the database
 * @param {Array} songArray - array with the top songs (can either be the users top songs, or the top songs of the decade)
 * @param {String} sessionId - the id of the current user session
 * @param {String} decade - the relevant decade beign compared ("" if we are getting info for user top songs)
 * @param {Number} retries - the number of times to retry the API request (if it fails)
 */

let getSongAudioInformation = async function (
  songArray,
  sessionId,
  decade,
  retries
) {
  let returnData = await getAudioInfo(retries); //await until

  //åconsole.log(returnData);
  let i = 0;

  for (var songObject of songArray) {
    //console.log(returnData[i]);
    console.log(songObject);
    if (returnData[i] == null) {
      songObject.danceability = -1;
      songObject.energy = -1;
      songObject.acousticness = -1;
      songObject.key = -1;
      songObject.mode = -1;
      songObject.valence = -1;
      songObject.speechiness = -1;
      songObject.tempo = -1;
    } else {
      songObject.danceability = returnData[i].danceability;
      songObject.energy = returnData[i].energy;
      songObject.acousticness = returnData[i].acousticness;
      songObject.key = returnData[i].key;
      songObject.mode = returnData[i].mode;
      songObject.valence = returnData[i].valence;
      songObject.speechiness = returnData[i].speechiness;
      songObject.tempo = returnData[i].tempo;
      songObject.instrumentalness = returnData[i].instrumentalness;
    }
    i++;

    if (songArray == fullInfoHitArray)
      await databaseTable.addSongToDatabase(songObject, decade, i);
    //indexing will change rank by 1 (index 0 has rank 1, but we need it saved to the db as rank 1)
    else {
      //console.log(songObject);
      //console.log(databaseTable);
      await databaseTable.addUserSongToDatabase(songObject, i, sessionId);
    } //works differentl
  }
};

/**
 * Usess spotify API to get the top tracks for the current user and creates object with the information returned and adds it to the array of tophits
 * @param {Number} retries - the number of times to retry the API request (if it fails)
 * @param {String} timeRange - specifies the time range to search for top tracks
 * @return {Promise} Array with the information on the users top hits (if successful), or throws an error (after all retries used up)
 */
let getUserTopTracks = async (timeRange, retries) => {
  return spotifyApi
    .getMyTopTracks({
      time_range: timeRange,
      limit: 50,
    })
    .then(
      async (data) => {
        for (var songObject of data.body.items) {
          songIdArray.push(songObject.id); //push to array to get audio features...
          let artistsId = [];
          //get all artists
          songObject.artists.forEach((songArtists) => {
            artistsId.push(songArtists.id);
          });

          let artistInfo = await getArtistInfo(artistsId, retries); //get

          //create object with information
          object = {
            spotifyId: songObject.id,
            name: songObject.name.replace("-[^-]*$").trim(),
            popularity: songObject.popularity,
            release: songObject.album.release_date,
            artists: artistInfo,
            imageUrl: songObject.album.images[0].url,
          };
          myTopHits.push(object); //push it to the array
        }
        return myTopHits;
      },
      async (err) => {
        if (retries > 0) {
          console.error(err);
          await asyncTimeout(
            err.headers["retry-after"]
              ? parseInt(err.headers["retry-after"]) * 1000
              : RETRY_INTERVAL
          );
          return getUserTopTracks(timeRange, retries - 1);

          //taken from:https://github.com/thelinmichael/spotify-web-api-node/issues/217
        }
      }
    );
};

/**
 * Gets the id for the currently authenticated user
 * @param {ParamDataTypeHere} req - allows session variable to be set with the userID
 */
let getUserId = (req) => {
  spotifyApi.getMe().then(
    function (data) {
      req.session.userId = data.body.id;
    },
    function (err) {
      console.log("Something went wrong!", err);
      return err;
    }
  );
};

/**
 * Gets the top artist for the current user based on specified time range
 * @param {String} timeRange - specifies the time range
 * @return {Arrat} Array of Object containing information about the users top 10 artists
 */
let getUserTopArtists = (timeRange) => {
  return spotifyApi
    .getMyTopArtists({
      time_range: timeRange,
      limit: 10,
    })
    .then(async (data) => {
      console.log(data);
      let topArtists = [];
      for (var ArtistObject of data.body.items) {
        topArtists.push({
          name: ArtistObject.name,
          image: ArtistObject.images[0].url,
        });
      }
      return topArtists;
    });
};

/*********************************** EXPORTED FUNTIONS ***********************************/
/**
 *
 * @summary gets the information for a specific query
 * @param {Object} req -the code generated after the user authorizes the app, allows use of session vars
 * @return {Object} Obj of all relevant information about the specific decade (top hits, artists, audio statistics)
 */

exports.getMusicInformation = async (req, decade) => {
  //only called when it is a decade...
  //need to check if database has the data...

  amount = await databaseTable.getAmount(decade);
  console.log(amount);
  if (amount > 0) {
    data = await databaseTable.getDecadeStatistics(decade);
    return data;
  } else {
    //need to run python script and get spotify authentication...

    return runPy(req)
      .then((data) => {
        top100Hits = formatData(data);

        return authorizeApp();
      })
      .then((data) => {
        // console.log("hi");
        //console.log(top100Hits);
        return getSongInformation();
      })
      .then((data) => {
        // console.log(fullInfoHitArray);

        return getSongAudioInformation(
          fullInfoHitArray,
          "",
          decade,
          req.session.retries
        );
      })
      .then((data) => {
        // console.log(fullInfoHitArray);
        //eturn saveToDatabase(fullInfoHitArray, "");
        return databaseTable.getDecadeStatistics(decade);
      })
      .then((data) => {
        fullInfoHitArray = [];
        top100Hits = [];
        spotifyApi = {}; //empty object again...
        return data;
      });
  }
};

/*********************************** EXPORTED FUNTIONS ***********************************/

/**
 * Brief description of the function here.
 * @summary gets the authorization URL for the current user by creating a new instance of the Spotify API
 * @param {String} req - the timeRange is the time range that the user would like get their own spotify data for (alltime, last 6 months or the last month)
 * @return {String} returns the authorization URL for current user
 */

exports.getAuthorizationURL = (timeRange, req) => {
  state = "some-state-of-my-choice"; //change later
  spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri, //this time we need user to authorize access
  });

  let authorizeURL = spotifyApi.createAuthorizeURL(
    ["user-top-read", "playlist-modify-public"],
    state
  ); //generated

  return authorizeURL;
};

//*********************************** EXPORTED FUNTIONS ***********************************/

/**
 *
 * @summary gets the audio information for the top tracks for the current user by authenticating and querying the spotify API
 * @param {req} Object - the code generated after the user authorizes the app, allows use of session vars
 * @return {Object} Object containing the relevant stats for the users listening habbits
 */

exports.getUserListeningHabbits = async (req) => {
  // databaseTable = determineDatabaseTable(""); //should be users
  console.log(databaseTable);
  return spotifyApi
    .authorizationCodeGrant(req.query.code)
    .then(
      (data) => {
        console.log("The token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);
        console.log("The refresh token is " + data.body["refresh_token"]);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        req.session.userTopRead = getReadChoice(req.session.userTopRead); //what data should be queried for...
      },
      (err) => {
        console.log("Something went wrong!", err);
      }
    )
    .then(async (data) => {
      getUserId(req);
    })
    .then(async (data) => {
      await databaseTable.createTempUser(req.session.id);
      return getUserTopTracks(req.session.userTopRead, req.session.retries); //gets the top tracks for the user
    })
    .then(async (data) => {
      console.log(myTopHits);
      await delay(230); //waits 230ms (gets around spotify api rate limiting)
      return getSongAudioInformation(
        myTopHits,
        req.session.id,
        req.session.decade,
        req.session.retries
      ); //gets the audio info each of the top hits
    })
    .then((data) => {
      //need to get the stats for the data...
      //need to get reccomendations...
      return databaseTable.getUserStatistics(
        req.session.id,
        req.session.decade
      );
    })
    .then(async (data) => {
      console.log(songIdArray);
      await databaseTable.deleteUserSongsFromDatabase(req.session.id);
      data["topArtists"] = await getUserTopArtists(req.session.userTopRead);
      myTopHits = [];
      return data;
    });
};

//*********************************** EXPORTED FUNTIONS ***********************************/
/**
 *
 * @summary creates a spotify playlist for the user
 * @param {req} Object - contains the information about the reccomended songs for user (based on decade)
 * @return {Promise}
 */
exports.createPlaylist = (req) => {
  //might have to refresh because the user does not immediately click create playlist
  let playlistURL = "";
  return spotifyApi
    .refreshAccessToken()
    .then(
      (data) => {
        console.log(data.body);
        return data;
      },
      (err) => {
        throw err;
      }
    )
    .then((data) => {
      //creates a public playlist
      return spotifyApi.createPlaylist(
        req.session.userId,
        `My ${req.session.decade}'s reccomendations!`,
        {
          public: true,
          description: `Some tracks from the ${req.session.decade}'s I might love`,
        }
      );
    })
    .then(
      (data) => {
        console.log(data.body);
        //use the req.comparator object to get the user reccomended songs and add them to playlist
        req.session.playlistId = data.body.id;
        playlistURL = data.body.external_urls.spotify;
        reccomendationIdArray = [];
        req.session.comparator["userReccomendations"].forEach((song) => {
          reccomendationIdArray.push(`spotify:track:${song.spotifyId}`);
        });
        return reccomendationIdArray;
      },
      (err) => {
        throw err;
      }
    )
    .then((data) => {
      spotifyApi.addTracksToPlaylist(req.session.playlistId, data);
    })
    .then(
      () => {
        return playlistURL;
      },
      (err) => {
        throw err;
      }
    );
};
