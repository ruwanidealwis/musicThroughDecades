/************* module imports  *******************************/
let SpotifyWebApi = require("spotify-web-api-node");
config = require("../../variableConfig.js");
/** @global */ const db = require("../../models/index.js");
var { PythonShell } = require("python-shell");

/********* variable declaration */
/** @global allhitdata */ var top100Hits; //stores 100 hits as retrived from webScraper
/** @global */ var fullInfoHitArray = []; //this array contains all the information on the song (audio features etc)
/** @global */ var songIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global */ var myTopHits = []; //spotify id's of the song, enabling to get audio information
/** @global */ var spotifyApi; //create an instance of webAPI
/** @global */ var clientId = process.env.CLIENTID; //client id for app
/** @global */ var clientSecret = process.env.CLIENTSECRET; //client secret for app
/** @global */ var redirectUri = process.env.CALLBACKURL;
/** @global */ var userTopRead = "";
/** @global */ var databaseTable; //the relevant table needed...

/*********************************************** SET BASIC INFO (if running locally...) *********************************/
if (process.env.PORT == null) {
  console.log("local");
  redirectUri = "http://localhost:8000/callback";
}

/************************ FUNCTIONS *******************************/
/**
 *Determines the database table valid for the decade passed
 * @summary Determines the database table valid for the decade being searchde for
 * @param {String} decade - the decade that is being compared
 * @return {Object} returns database object of the correct table to query
 */
let determineDatabaseTable = (decade) => {
  let table;
  console.log(decade);
  switch (decade) {
    case "1950":
      table = db.fifties;
      break;
    case "1960":
      table = db.sixties;
      break;
    case "1970":
      table = db.seventies;
      break;
    case "1980":
      table = db.eighties;
      break;
    case "1990":
      console.log("hwere");
      table = db.nineties;
      break;
    case "2000":
      table = db.twothousands;
      break;
    case "2010":
      console.log("hwere");
      table = db.twenty10s;
      break;
  }
  return table;
};

/**
 * Gets the time range for the top songs according to what the user wnats
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
 * runs python script that webscrapes (should ideally only run once) for billboard music data
 *
 * @param {string} decade - the decade where the data is searched for
 * @return {Promise} returns the data (or error)
 */

let runPy = (decade) => {
  return new Promise(function (success, nosuccess) {
    let options = {
      mode: "text",
      pythonPath:
        "/Library/Frameworks/Python.framework/Versions/3.8/bin/python3",
      pythonOptions: ["-u"], // get print results in real-time
      scriptPath:
        "/Users/ruwanidealwis/Downloads/GitHub/musicThroughDecades/server/webScraperPython", //should update to local path...
      args: [decade],
    };
    console.log(decade);
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
 * @return {Array} Returns object array with information extracted (track, artists, year)
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
    //console.log(splitHit[0]);
    allHitsArray.push({
      track: splitHit[0] || hit,
      artist: artists[0],
      year: splitHit[2].replace("'", "") || "",
    }); //because of the way the website is structured (this may not be exactly correc t)
  });

  console.log(allHitsArray);
  return allHitsArray;
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
        if (data.body.tracks.items === []) {
          //console.log(trackObject.track);
        }
        console.log(trackObject);
        //console.log(data.body.tracks.items || trackObject.track);

        if (
          trackObject.track == "Careless Whisper" ||
          trackObject.artist == "Careless Whisper"
        ) {
          //console.log(data.body);
          //console.log(data.body.tracks.items);
        }
        console.log(data.body);
        return data.body.tracks.items[0];
      },
      function (err) {
        console.error(err);
        return err;
      }
    )
    .then(
      (data) => {
        //format array properly...
        if (data == null) {
          let object = {
            id: "",
            albumId: "",
            name: "",
            release: trackObject.year,
            image: "",
            artists: [],
            popularity: -1,
          };
          fullInfoHitArray.push(object);
          songIdArray.push("");
        } else {
          let artists = [];
          data.artists.forEach((artist) => {
            artists.push(artist.name);
          });
          let object = {
            id: data.id,
            albumId: data.album.id,
            name: trackObject.track,
            release: trackObject.year,
            image: data.album.images[0].url,
            artists: artists,
            popularity: data.popularity,
          };
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
  console.log(fullInfoHitArray);
  return fullInfoHitArray;
};
/**
 * Gets audio features for the tracks in the top 100 list using the spotify ids of the songs
 * @summary traverses the list of all top 100 songs to get the audio features for the track using the spotify API
 * @return {Promise} resolves to the audio features for the track or the error
 */
let getAudioInfo = async function () {
  return spotifyApi.getAudioFeaturesForTracks(songIdArray).then(
    function (data) {
      //console.log(data.body);
      return data.body.audio_features;
    },
    function (err) {
      console.error(err);
      return err;
    }
  );
};

/**
 * Brief description of the function here.
 * @summary adds keys to objects of the to array of the top songs with the information generated from the audio feature query of the spotify API
 * @param {Array} songArray - array with the top songs (can either be the users top songs, or the top songs of the decade)
 */

let getSongAudioInformation = async function (songArray) {
  let returnData = await getAudioInfo(); //await until

  //åconsole.log(returnData);
  let i = 0;

  songArray.forEach((songObject) => {
    console.log(returnData[i]);
    if (returnData[i] == null) {
      songObject.danceability = -1;
      songObject.energy = -1;
      songObject.acousticness = -1;
      songObject.key = -1;
      songObject.mode = -1;
      songObject.valence = -1;
      songObject.speechiness = -1;
      songObject.tempo = -1;
      i++;
    } else {
      songObject.danceability = returnData[i].danceability;
      songObject.energy = returnData[i].energy;
      songObject.acousticness = returnData[i].acousticness;
      songObject.key = returnData[i].key;
      songObject.mode = returnData[i].mode;
      songObject.valence = returnData[i].valence;
      songObject.speechiness = returnData[i].speechiness;
      songObject.tempo = returnData[i].tempo;
      i++;
    }
  });

  //waits till promise is resolved (this maintains order)
  console.log("done");
};

/**
 * Usess spotify API to get the top tracks for the current user and creates object with the information returned and adds it to the array of tophits
 * @return {Array} Array with the information on the users top hits
 */
let getUserTopTracks = () => {
  return spotifyApi
    .getMyTopTracks({
      time_range: userTopRead,
      limit: 50,
    })
    .then((data) => {
      data.body.items.forEach((songObject) => {
        songIdArray.push(songObject.id); //push to array to get audio features...

        //get all artists
        let artist = [];
        songObject.artists.forEach((songArtists) => {
          artist.push(songArtists.name);
        });
        //create object with information
        object = {
          name: songObject.name,
          popularity: songObject.popularity,
          yearOfRelease: songObject.album.release_date,
          artists: artist,
          imageUrl: songObject.album.images[0].url,
        };
        myTopHits.push(object); //push it to the array
      });
      return myTopHits;
    });
};
/**
 *
 * @summary Updates the tables of the postgres database with all the information of the top 100 songs for the current decade
 */
let saveToDatabase = async () => {
  index = 1;
  for (const songObjects of fullInfoHitArray) {
    let dateArray = songObjects.release.split("-"); //get the date (we only care about year, not exact date)
    console.log(songObjects);
    //create a row with the information (INSERT INTO)
    await databaseTable.create({
      song: songObjects.name,
      artists: songObjects.artists,
      yearOfRelease: dateArray[0],
      imageUrl: songObjects.image,
      valence: songObjects.valence,
      danceability: songObjects.danceability,
      popularity: songObjects.popularity,
      key: songObjects.key,
      mode: songObjects.mode,
      speechiness: songObjects.speechiness,
      tempo: songObjects.speechiness,
      acousticness: songObjects.acousticness,
      energy: songObjects.energy,
      rank: index,
    });
    index++;
  }
}; /*********************************** EXPORTED FUNTIONS ***********************************/
/**
 *
 * @summary gets the information for a specific query
 * @param {string} comparator - the decade to get the top hits for
 * @return {Array} Array of all relevant information about the specific decade (top hits, artists, audio statistics)
 */
exports.getMusicInformation = async (comparator) => {
  //only called when it is a decade...
  //need to check if database has the data...

  databaseTable = determineDatabaseTable(comparator);
  const amount = await databaseTable.count();
  console.log(amount);
  if (amount > 0) {
    //already in database...we can load from there else
    //load data from DB...
  } else {
    //need to run python script and get spotify authentication...
    console.log(comparator);
    runPy(comparator)
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
        //console.log(data);

        return getSongAudioInformation(fullInfoHitArray);
      })
      .then((data) => {
        // console.log(fullInfoHitArray);

        return saveToDatabase();
      })
      .then(() => {
        databaseTable = {};
        fullInfoHitArray = [];
        top100Hits = [];
        spotifyApi = {}; //empty object again...
      });
  }
}; /*********************************** EXPORTED FUNTIONS ***********************************/

/**
 * Brief description of the function here.
 * @summary gets the authorization URL for the current user by creating a new instance of the Spotify API
 * @param {String} timeRange - the timeRange is the time range that the user would like get their own spotify data for (alltime, last 6 months or the last month)
 * @return {String} returns the authorization URL for current user
 */

exports.getAuthorizationURL = (timeRange) => {
  state = "some-state-of-my-choice"; //change later
  spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri, //this time we need user to authorize access
  });

  let authorizeURL = spotifyApi.createAuthorizeURL(["user-top-read"], state); //generated
  userTopRead = getReadChoice(timeRange); //what data should be queried for...
  return authorizeURL;
};

//*********************************** EXPORTED FUNTIONS ***********************************/
/**
 *
 * @summary gets the audio information for the top tracks for the current user by authenticating and querying the spotify API
 * @param {req} String - the code generated after the user authorizes the app
 * @return {Array} Array of object containing all the relevant information for the user top tracks
 */

exports.getUserListeningHabbits = async (req) => {
  spotifyApi
    .authorizationCodeGrant(req.query.code)
    .then(
      (data) => {
        console.log("The token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);
        console.log("The refresh token is " + data.body["refresh_token"]);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
      },
      (err) => {
        console.log("Something went wrong!", err);
      }
    )
    .then((data) => {
      return getUserTopTracks(); //gets the top tracks for the user
    })
    .then((data) => {
      return getSongAudioInformation(myTopHits); //gets the audio info each of the top hits
    })
    .then(() => console.log(myTopHits));
};
