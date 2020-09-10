/************* module imports  *******************************/
let SpotifyWebApi = require("spotify-web-api-node");
config = require("../variableConfig.js");
var { PythonShell } = require("python-shell");
const Papa = require("papaparse");
const fs = require("fs");

/********* variable declaration */
/** @global allhitdata */ var top100Hits; //stores 100 hits as retrived from webScraper
/** @global full array with relevant info of top songs for decade */ var fullInfoHitArray = []; //this array contains all the information on the song (audio features etc)
/** @global spotify id's of songs*/ var songIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global spotify id's of songs*/ var albumIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global spotify id's of songs*/ var topArtistIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global spotify id's of songs*/ var artistsIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global user top hits for specific range*/ var myTopHits = []; //spotify id's of the song, enabling to get audio information
/** @global spotify web api wrapper*/ var spotifyApi; //create an instance of webAPI
/** @global clientID of app */ var clientId = process.env.CLIENTID; //client id for app
/** @global clientSecret of app*/ var clientSecret = process.env.CLIENTSECRET; //client secret for app
/** @global redirectUri for spotify user authentication*/ var redirectUri =
  process.env.CALLBACKURL;
/** @global timerange for user top songs*/ var userTopRead = "";
/** @global stores databasetable*/ var databaseTable = require("./databaseController");
const { resolve } = require("path");

/*********************************************** SET BASIC INFO (if running locally...) *********************************/
if (process.env.PORT == null) {
  //console.log("local");
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

let getCSVData = (decade) => {
  var file = fs.createReadStream(`dataFiles/${decade}.csv`);
  Papa.parse(file, {
    dynamicTyping: true,
    complete: function (results) {
      console.log(results.data);
      top100Hits = formatData(results.data);
      console.log(top100Hits);
    },
  });

  file = fs.createReadStream(`dataFiles/${decade}Artists.csv`);
  Papa.parse(file, {
    delimiter: "|",
    complete: function (results) {
      console.log("hello");
      console.log(results.data);
      for (const artist of results.data) {
        topArtistIdArray.push(artist[1]);
      }
    },
  });

  /*return new Promise(function (success, nosuccess) {
>>>>>>> Stashed changes
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
        //console.log(err);
        nosuccess(err);
      }
      // results is an array consisting of messages collected during execution
      success(results);
    });
  });*/
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
        //console.log("The access token expires in " + data.body["expires_in"]);
        //console.log("The access token is " + data.body["access_token"]);

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
  let allHitsArray = [];
  for (const hit of data) {
    allHitsArray.push({
      track: hit[0],
      year: hit[2],
      artists: hit[5].split(",").length,
      artistRank: hit[3],
    }); //because of the way the website is structured (this may not be exactly correc t)

    hit[5].split(",").forEach((id) => artistsIdArray.push(id));

    //console.log("artistsId");
    // console.log(artistsIdArray);
    songIdArray.push(hit[4]);
    albumIdArray.push(hit[6]);
    console.log(hit[5]);
    console.log(hit[5].split(",").length);
  }
  return allHitsArray;
  /*
=======
    //console.log("artistsId");
    //console.log(artistsIdArray);
    songIdArray.push(hit[4]);
    albumIdArray.push(hit[6]);
    //console.log(hit[5]);
    //console.log(hit[5].split(",").length);
  }
  return allHitsArray;
  /*
>>>>>>> Stashed changes
>>>>>>> Stashed changes
  let dataToModify = data[0];
  //console.log(dataToModify);
  let allHitsArray = [];
  let newData = dataToModify.substring(1, data[0].length - 1).split("',");

<<<<<<< Updated upstream

=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
  console.log(newData);
=======

  //console.log(newData);
>>>>>>> Stashed changes

  newData.forEach((hit) => {
    //console.log(hit);
    let artists = [];
    let splitHit = hit.replace("'", "").split(" - ");
    if (splitHit[1] != null) artists = splitHit[1].split("&") || "";
    if (splitHit[2] == null) splitHit[2] = "";
    if (splitHit[3] == null) splitHit[3] = 101;
    ////console.log(splitHit[0]);
    allHitsArray.push({
      track: splitHit[0] || hit,
      artist: artists[0],
      year: splitHit[2].replace("'", ""),
      artistRank: parseInt(splitHit[3]),
    }); //because of the way the website is structured (this may not be exactly correc t)
  });


};
*/
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
      index = 0;
      ////console.log("Artist information", data.body.artists);
      data.body.artists.forEach((artistObject) => {
        ////console.log(artistObject);
        image = "";
        //console.log(index);
        if (artistObject.images[0] != null) image = artistObject.images[0].url;
        let obj = {
          name: artistObject.name,
          genres: artistObject.genres,
          image: image,
        };
        artistArray.push(obj);
        index++;
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

var getBasicSongInfo = async (songIdArray, startIndex) => {
  let returnData = [];
  let i = startIndex;
  return spotifyApi.getTracks(songIdArray).then((data) => {
    for (const track of data.body.tracks) {
      let object = {
        spotifyId: track.id,
        albumId: track.album.id,
        name: track.name.split("-")[0].trim(), //taken from: https://stackoverflow.com/questions/4292468/javascript-regex-remove-text-between-parentheses
        release: top100Hits[i].year,
        artists: top100Hits[i].artists,
        image: track.album.images[0].url,
        popularity: track.popularity,
        previewURL: track.preview_url,
        artistRank: top100Hits[i].artistRank,
      };
      if (object.release === 0) {
        object.release = parseInt(track.album.release_date.split("-")[0]);
      }
      returnData.push(object);

      //console.log(object.artists);
      //console.log(object.release);
      //console.log(object.name);
      i = i + 1;
      //console.log(i);
    }
    return returnData;
  });
  /*return spotifyApi
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
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
            previewURL: data.preview_url,
            artistRank: trackObject.artistRank,
          };
          if (object.release === "") {
            object.release = data.album.release_date;
          }

          if (data.preview_url == null) {
            //console.log("sajiodjaiojeqioajsdiojasdiojio");
            delay(200);
            let track = await spotifyApi.getTrack(data.id, { market: "US" });
            //console.log(track.body.preview_url);
            object.previewURL = track.body.preview_url;
          }
          //console.log(data.album.release_date);
          fullInfoHitArray.push(object);
          songIdArray.push(data.id);
        }
        return fullInfoHitArray;
      },
      (error) => {
        return err;
      }
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
    );
=======
>>>>>>> Stashed changes
    );*/
};

let getAlbumInfo = async function (partialAlbumIds) {
  spotifyApi.getAlbums(partialAlbumIds).then((data) => {});

  //console.log(data.body);
};

/**
 * @summary traverses the list of all top 100 songs to get the basic info for the track using the spotify API
 * @return {Array} Array of objects with full info about the audio features
 */
let getSongInformation = async function (decade) {
  let arr = [0, 50, 100, 150, 200];
  let artistInfo = [];
  for (const index of arr) {
    if (index > artistsIdArray.length) {
      break;
    }
    let end = index + 50;
    if (end > artistsIdArray.length) {
      end = index + (artistsIdArray.length % 50);
    }
    let partialArtistIds = artistsIdArray.slice(index, end);
    console.log(partialArtistIds);
    artistInfo = artistInfo.concat(await getArtistInfo(partialArtistIds));
  }
  let firstHalf = songIdArray.slice(0, 50);
  let secondHalf = songIdArray.slice(50, 100);
  // console.log(secondHalf);
  let firstHalfData = await getBasicSongInfo(firstHalf, 0);
  let secondHalfData = await getBasicSongInfo(secondHalf, 50);
  let audioData = await getAudioInfo(3); //await until
  let fullInfoHitArray = firstHalfData.concat(secondHalfData);
  let artistIndex = 0;
  for (let i = 0; i < 100; i++) {
    fullInfoHitArray[i].danceability = audioData[i].danceability;
    fullInfoHitArray[i].energy = audioData[i].energy;
    fullInfoHitArray[i].acousticness = audioData[i].acousticness;
    fullInfoHitArray[i].key = audioData[i].key;
    fullInfoHitArray[i].mode = audioData[i].mode;
    fullInfoHitArray[i].valence = audioData[i].valence;
    fullInfoHitArray[i].speechiness = audioData[i].speechiness;
    fullInfoHitArray[i].tempo = audioData[i].tempo;
    fullInfoHitArray[i].instrumentalness = audioData[i].instrumentalness;

    let length = fullInfoHitArray[i].artists; //number of artists per song...
    let end = artistIndex + length;
    fullInfoHitArray[i].artists = [];
    //start from where we left off, and add until we get to length
    for (let j = artistIndex; j < end; j++) {
      fullInfoHitArray[i].artists.push(artistInfo[j]);
      /* console.log(fullInfoHitArray[i].name);
      console.log(artistInfo[j]);
      console.log("start " + artistIndex);
      console.log("end " + end);
      console.log("full length " + parseInt(artistIndex));
      console.log(i);*/
    }

    artistIndex = end;
    await databaseTable.addSongToDatabase(fullInfoHitArray[i], decade, i);
  }

  console.log(fullInfoHitArray);
  //console.log(artistInfo.length);
  //console.log(fullInfoHitArray);
  /*for (const trackObject of top100Hits) {
=======
<<<<<<< Updated upstream
let getSongInformation = async function () {
  for (const trackObject of top100Hits) {
>>>>>>> Stashed changes
    //console.log(trackObject);
    await getBasicSongInfo(trackObject);
    //await genreInformation(trackObject); //gets genre of ALBUM!
  } //waits till promise is resolved (this maintains order)
  console.log("done");
  //console.log(fullInfoHitArray);*/

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
      //console.log(songIdArray);

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

  //å//console.log(returnData);
  let i = 0;

  for (var songObject of songArray) {
    ////console.log(returnData[i]);
    //console.log(songObject);
    if (returnData[i] === null) {
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

    if (songArray === fullInfoHitArray)
      await databaseTable.addSongToDatabase(songObject, decade, i);
    //indexing will change rank by 1 (index 0 has rank 1, but we need it saved to the db as rank 1)
    else {
      ////console.log(songObject);
      ////console.log(databaseTable);
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
  //console.log(timeRange);
  //console.log(spotifyApi);
  return spotifyApi
    .getMyTopTracks({
      time_range: timeRange,
      limit: 50,
    })
    .then(
      async (data) => {
        //console.log(data);
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
            previewURL: songObject.preview_url,
            release: songObject.album.release_date,
            artists: artistInfo,
            imageUrl: songObject.album.images[0].url,
          };
          myTopHits.push(object); //push it to the array
        }
        return myTopHits;
      },
      async (err) => {
        //console.log(err);
        /* if (retries > 0) {
          console.error(err.headers);
          (await err.headers["retry-after"])
            ? parseInt(err.headers["retry-after"]) * 1000
            : 3000;

          return getUserTopTracks(timeRange, retries - 1);}*/
        //taken from:https://github.com/thelinmichael/spotify-web-api-node/issues/217
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
      //console.log("Something went wrong!", err);
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
      //console.log(data);
      let topArtists = [];
      for (var ArtistObject of data.body.items) {
        topArtists.push({
          name: ArtistObject.name,
          image: ArtistObject.images[0].url,
          genres: ArtistObject.genres,
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

  //need to run python script and get spotify authentication...
  if (songIdArray.length != 0) {
    top100Hits = [];
    fullInfoHitArray = [];
    artistsIdArray = [];
    songIdArray = [];
    albumIdArray = [];
    topArtistIdArray = [];
  }
  console.log("getting csv");
  console.log(decade);
  await getCSVData(decade);
  if (req.session.type === "decade") await authorizeApp();
  else {
    //authenticated for users...
    if (spotifyApi.getRefreshToken() != null) {
      let data = await spotifyApi.refreshAccessToken();
      spotifyApi.setAccessToken(data.body["access_token"]);

      console.log("refreshAccessToken");
      req.session.userTopRead = getReadChoice(req.session.userTopRead); //what data should be queried for...
      console.log(data);

      //console.log("refreshAccessToken");
      req.session.userTopRead = getReadChoice(req.session.userTopRead); //what data should be queried for...
      //console.log(data);
    } else {
      let data = await spotifyApi.authorizationCodeGrant(req.query.code);
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);
    }
  }

  await getSongInformation(decade);

  let data = await databaseTable.getDecadeStatistics(decade);
  if (decade !== "2010") {
    data["topArtists"] = await getArtistInfo(topArtistIdArray);
  }

  top100Hits = [];
  fullInfoHitArray = [];
  artistsIdArray = [];
  songIdArray = [];
  albumIdArray = [];
  topArtistIdArray = [];

  return data;
  /*return getCSVData(req)
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
      .then((data) => {
        return authorizeApp();
      })
      .then(async (data) => {
        // //console.log("hi");
        ////console.log(top100Hits);
        /*let login = await spotifyApi.authorizationCodeGrant(req.query.code);
        spotifyApi.setAccessToken(login.body["access_token"]);
        spotifyApi.setRefreshToken(login.body["refresh_token"]);
        return getSongInformation();})
      .then((data) => {
        // //console.log(fullInfoHitArray);

        return getSongAudioInformation(
          fullInfoHitArray,
          "",
          decade,
          req.session.retries
        );
      })
      .then((data) => {
        // //console.log(fullInfoHitArray);
        //eturn saveToDatabase(fullInfoHitArray, "");
        return databaseTable.getDecadeStatistics(decade);
      })
      .then((data) => {
        fullInfoHitArray = [];
        top100Hits = [];
        spotifyApi = {}; //empty object again...
        return data;
      });*/
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
  //console.log(redirectUri);
  //console.log(authorizeURL);
  return authorizeURL;
};

//*********************************** EXPORTED FUNTIONS ***********************************/

/**
 *
 * @summary gets the audio information for the top tracks for the current user by authenticating and querying the spotify API
 * @param {req} Object - the code generated after the user authorizes the app, allows use of session vars
 * @return {Object} Object containing the relevant stats for the users listening habbits
 */

exports.getUserListeningHabbits = async (req, res) => {
  // databaseTable = determineDatabaseTable(""); //should be users
  if (spotifyApi == undefined) {
    res.redirect("/login");
  } else {
    //console.log(spotifyApi.getRefreshToken());
    if (spotifyApi.getRefreshToken() == null) {
      let data = await spotifyApi.authorizationCodeGrant(req.query.code);
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);
      console.log(spotifyApi);

      req.session.userTopRead = getReadChoice(req.session.userTopRead); //what data should be queried for...

      /* //console.log("got here");
      let data = await spotifyApi.authorizationCodeGrant(req.query.code);
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);
      //console.log(spotifyApi);
      req.session.userTopRead = getReadChoice(req.session.userTopRead); //what data should be queried for...*/
    } else {
      let data = await spotifyApi.refreshAccessToken();
      spotifyApi.setAccessToken(data.body["access_token"]);
      //console.log("refreshAccessToken");
      req.session.userTopRead = getReadChoice(req.session.userTopRead); //what data should be queried for...
      //console.log(data);
    }

    await getUserId(req);
    await databaseTable.createTempUser(req.session.id);
    //console.log(req.session);
    await getUserTopTracks(req.session.userTopRead, req.session.retries); //gets the top tracks for the user
    await delay(230); //waits 230ms (gets around spotify api rate limiting)

    await getSongAudioInformation(
      myTopHits,
      req.session.id,
      req.session.decade,
      req.session.retries
    ); //gets the audio info each of the top hits
    let userData = await databaseTable.getUserStatistics(
      req.session.id,
      req.session.decade
    );

    await databaseTable.deleteUserSongsFromDatabase(req.session.id);
    userData["topArtists"] = await getUserTopArtists(req.session.userTopRead);
    songIdArray = [];
    myTopHits = [];
    return userData;
  }
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
        //console.log(data.body);
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
        //console.log(data.body);
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
