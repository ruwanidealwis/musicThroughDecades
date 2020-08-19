/************* module imports  *******************************/
let SpotifyWebApi = require("spotify-web-api-node");
config = require("../../variableConfig.js");
/** @global */ const db = require("../../models/index.js");
var { PythonShell } = require("python-shell");
const { Sequelize } = require("../../models/index.js");
const artist = require("../../models/artist.js");

/********* variable declaration */
/** @global allhitdata */ var top100Hits; //stores 100 hits as retrived from webScraper
/** @global decade being searched */ var decade; //stores 100 hits as retrived from webScraper
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

/************************ FUNCTIONS *******************************/
/**
 *Determines the database table valid for the decade passed
 * @summary Determines the database table valid for the decade being searchde for
 * @param {String} decade - the decade that is being compared
 * @return {Object} returns database object of the correct table to query
 */
//taken from: https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
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
      console.log(db);
      break;
    case "1990":
      console.log("hwere");
      table = db.nineties;
      console.log(db.nineties);
      break;
    case "2000":
      table = db.twothousands;
      break;
    case "2010":
      console.log("hwere");
      table = db.twenty10s;
      break;
    default:
      console.log("hello");
      console.log(db.tempUser);
      table = db.tempUser;
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

let getFeatureAverageForDecade = async (feature) => {
  //weighted?, not weighted?
};
let getCountForDecade = async (feature) => {
  const { Op } = require("sequelize");
  const { Sequelize } = require("sequelize");
  let data = await databaseTable.findAll({
    attributes: [
      feature,
      [Sequelize.fn("COUNT", Sequelize.col(feature)), "count"],
    ],
    where: { [feature]: { [Op.or]: { [Op.ne]: -1, [Op.ne]: "-1" } } }, //this is when spotify could not identify a key...
    group: feature, //group by feature
    raw: true, //get raw data
  });

  console.log(data);
  return data;
};

let getTopArtistsForDecade = async (decade) => {
  const { Sequelize } = require("sequelize");
  const { QueryTypes } = require("sequelize");
  let data = await databaseTable.sequelize.query(
    `select artist, count(artist) as numHits from (select song,(unnest(artists)) as artist from ${databaseTable.tableName}) as x group by artist order by numHits desc limit 5`,
    {
      replacements: { table: "eighties" },
      model: databaseTable,
      mapToModel: true, // pass true here if you have any mapped fields
      raw: true,
    }
  );
  return data;
};
let getAverageFeatureForDecade = async (feature, year) => {
  const { Sequelize } = require("sequelize");
  letYearlyInfo = [];
  for (let i = 0; i < 10; i++) {
    featureArray = [];
    //gets the top songs for a specific year based on a feature (ex: happiest songs of 1995)
    let data = await databaseTable.findAll({
      attributes: [[Sequelize.fn("AVG", Sequelize.col(feature)), "average"]],
      where: { yearOfRelease: parseInt(year) },
      raw: true,
    });
    //creates an array of objects with these songs
    console.log(data[0]);
    letYearlyInfo.push(data[0].average); //puts each year into a final array (ex: index 0 is year 1990, index 1 is year 1991)
    year++;
  }
  //TODO fix rank 95, and rank 7 for 1970s
  return letYearlyInfo;
};
let getTopValues = (feature, limit, ordering) => {
  let featureArray = [];
  //gets the top songs for a specific feature
  return databaseTable
    .findAll({
      attributes: ["song", "artists", "yearOfRelease", feature, "rank"],
      order: [[feature, ordering]],
      limit: limit,
    })
    .then((data) => {
      data.forEach((song) => {
        featureArray.push({
          name: song.song,
          artists: song.artists,
          [feature]: song[feature],
          year: song.yearOfRelease,
          rank: song.rank,
        });
      });
      return featureArray; //created an object of arrays with these top songs, the array is returned
    });
};

let getDecadeStatistics = async (decade) => {
  fullStatsObject = {};
  const { Sequelize } = require("sequelize");
  let featureArray = [
    "valence",
    "speechiness",
    "energy",
    "danceability",
    "acousticness",
    "tempo",
  ];

  for (const feature of featureArray) {
    let descTopArray = await getTopValues(feature, 3, "DESC"); //waits for the top values of each feature (ex: 3 happiest songs of 1996)
    let ascTopArray = await getTopValues(feature, 3, "ASC"); //waits for the lowest values of each feature (ex: 3 saddest songs of 1995)
    let yearlyInfoArray = await getAverageFeatureForDecade(feature, decade); //gets the average value for each year for a specific feature
    //adds to the full statsObject
    fullStatsObject[`highest_${feature}`] = descTopArray;
    fullStatsObject[`lowest_${feature}`] = ascTopArray;
    fullStatsObject[`yearly_${feature}`] = yearlyInfoArray;
  }
  //get most and least popular songs
  let mostPopularToday = await getTopValues("popularity", 5, "DESC");
  let leastPopularToday = await getTopValues("popularity", 5, "ASC");

  //get distriubtion for mode and key
  let getModeCount = await getCountForDecade("mode");
  let getKeyCount = await getCountForDecade("key");

  fullStatsObject.mostPopularToday = mostPopularToday;
  fullStatsObject.leastPopularToday = leastPopularToday;
  fullStatsObject.modeCount = getModeCount;
  fullStatsObject.keyCount = getKeyCount;
  fullStatsObject.mostHits = g;
  console.log(fullStatsObject);
  await getTopArtistsForDecade();
};
let getUserStatistics = async (req) => {
  //check if it is user (if yes, table... and add songs)
  //database hsould be unique to decade...
  //TODO need top 5 songs, top 5 artists, average valence (for decade/user, for each year (only for decade)....), average danceability, average energy, average tempo, average accousticness, speechiness (top 3 songs for each), mode dsitribution, key distribution,
  //TODO get ranked averages for each feature....and top artists (need to unnest table)
  //TODO need to fix all lowest popularity....they are wrong!
  //check if it is user (if yes DROP ALL ROWS, IT NEEDS TO BE EMPTY)
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

var getArtistInfo = async (ids) => {
  let artistArray = [];
  return spotifyApi.getArtists(ids).then(
    function (data) {
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
    function (err) {
      console.error(err.body);

      return err;
    }
  );
};
var getBasicSongInfo = async (trackObject) => {
  return spotifyApi
    .searchTracks((trackObject.track || "") + " " + (trackObject.artist || ""))
    .then(
      function (data) {
        if (data.body.tracks.items === []) {
          //console.log(trackObject.track);
        }
        //console.log(trackObject);
        //console.log(data.body.tracks.items || trackObject.track);

        if (
          trackObject.track == "Careless Whisper" ||
          trackObject.artist == "Careless Whisper"
        ) {
          //console.log(data.body);
          //console.log(data.body.tracks.items);
        }
        //console.log(data.body);
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
            name: "",
            release: trackObject.year,
            image: "",
            artists: [],
            popularity: -1,
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
            id: data.id,
            albumId: data.album.id,
            name: trackObject.track.trim(),
            release: trackObject.year,
            image: data.album.images[0].url,
            artists: artistInfo,
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
  //console.log(fullInfoHitArray);
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

    if (songArray == top100Hits)
      await databaseTable.addSongToDatabase(songObject, decade, i);
    //indexing will change rank by 1 (index 0 has rank 1, but we need it saved to the db as rank 1)
    else await databaseTable.addUserSongToDatabase(songObject, i); //works differentl
  }
};

//add songs to database here... (one by 1....)

//waits till promise is resolved (this maintains order)

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
          release: songObject.album.release_date,
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
let saveToDatabase = async (songArray, id) => {
  index = 1;
  for (const songObjects of songArray) {
    let dateArray = songObjects.release.split("-"); //get the date (we only care about year, not exact date)
    console.log(songObjects);
    //create a row with the information (INSERT INTO)
    if (songArray == fullInfoHitArray) {
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
        tempo: songObjects.tempo,
        acousticness: songObjects.acousticness,
        energy: songObjects.energy,
        rank: index,
      });
    } else {
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
        sessionID: id,
      });
    }

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
  decade = comparator; //need this for user data, not emptied out after operations are complete
  // databaseTable = determineDatabaseTable(comparator);
  //const amount = await databaseTable.count();
  const amount = 0; //TODO test will have to fix later
  console.log(amount);
  //databaseTable.test();
  if (amount > 0) {
    //already in database...we can load from there else
    //load data from DB...
    return getDecadeStatistics(comparator);
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
        // console.log(fullInfoHitArray);

        return getSongAudioInformation(fullInfoHitArray);
      })
      .then((data) => {
        // console.log(fullInfoHitArray);
        //eturn saveToDatabase(fullInfoHitArray, "");
        databaseTable = {};
        fullInfoHitArray = [];
        top100Hits = [];
        spotifyApi = {}; //empty object again...
      });
  }
};

/*********************************** EXPORTED FUNTIONS ***********************************/

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
  databaseTable = determineDatabaseTable(""); //should be users
  console.log(databaseTable);
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
    .then((data) => {
      saveToDatabase(myTopHits, req.session.id);
    });
};
