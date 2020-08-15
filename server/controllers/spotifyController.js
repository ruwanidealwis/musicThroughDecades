/************* module imports  *******************************/
let SpotifyWebApi = require("spotify-web-api-node");
config = require("../../variableConfig.js");
/** @global */ const db = require("../../models/index.js");
var { PythonShell } = require("python-shell");

/********* variable declaration */
/** @global */ var top100Hits; //stores 100 hits as retrived from webScraper
/** @global */ var fullInfoHitArray = []; //this array contains all the information on the song (audio features etc)
/** @global */ var songIdArray = []; //spotify id's of the song, enabling to get audio information
/** @global */ var spotifyApi; //create an instance of webAPI
/** @global */ var clientId = process.env.CLIENTID; //client id for app
/** @global */ var clientSecret = process.env.CLIENTSECRET; //client secret for app
/** @global */ var databaseTable; //the relevant table needed...

/*********************************************** SET BASIC INFO (if running locally...) *********************************/
if (process.env.PORT == null) {
  console.log("local");
  redirectUri = "http://localhost:8000/callback";
}

/************************ FUNCTIONS *******************************/

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

let runPy = (decade) => {
  /**
   * runs python script that webscrapes (should ideally only run once) for billboard music data
   *
   * @param {string} decade - the decade where the data is searched for
   * @return {Promise} returns the data (or error)
   */

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

async function authorizeApp() {
  /**
   * @summary Authorizes the app through spotify client credential, only when there does not need to be user authentication
   * @return {Promise} returns a promise that resolves to the instance of the spotifyWebAPI (that is a authorized), or returns an error
   */

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
}
formatData = (data) => {
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

var getBasicSongInfo = async function (trackObject) {
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
    .then((data) => {
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
      //console.log(object);
    });
};
getSongInformation = async function () {
  for (const trackObject of top100Hits) {
    //console.log(trackObject);
    await getBasicSongInfo(trackObject);
    //await genreInformation(trackObject); //gets genre of ALBUM!
  } //waits till promise is resolved (this maintains order)
  console.log("done");
  console.log(fullInfoHitArray);
  return fullInfoHitArray;
};

getAudioInfo = async function () {
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

getSongAudioInformation = async function () {
  let returnData = await getAudioInfo();

  //åconsole.log(returnData);
  let i = 0;

  fullInfoHitArray.forEach((songObject) => {
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

saveToDatabase = async () => {
  index = 1;
  for (const songObjects of fullInfoHitArray) {
    let dateArray = songObjects.release.split("-");
    console.log(songObjects);
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
};
/*********************************** EXPORTED FUNTIONS ***********************************/
exports.getMusicInformation = async function (comparator) {
  //only called when it is a decade...
  //need to check if database has the data...
  console.log(databaseTable);
  databaseTable = determineDatabaseTable(comparator);
  console.log(databaseTable);
  const amount = await databaseTable.count();
  console.log(amount);
  if (amount > 0) {
    //already in database...we can load from there else
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

        return getSongAudioInformation();
      })
      .then((data) => {
        // console.log(fullInfoHitArray);

        return saveToDatabase();
      })
      .then(() => {
        databaseTable = {};
        fullInfoHitArray = [];
        top100Hits = [];
      });
  }

  // Retrieve an access token.
  /*spotifyApi.clientCredentialsGrant().then(
    function (data) {
      console.log("The access token expires in " + data.body["expires_in"]);
      console.log("The access token is " + data.body["access_token"]);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body["access_token"]);
    },
    function (err) {
      console.log("Something went wrong when retrieving an access token", err);
    }
  );*/
};
/*exports.authorizeSpotify = (comparators) => {
  let userSpotify = ["all-time", "6 months", "1 month"];
  if (
    userSpotify.includes(comparators[0]) ||
    userSpotify.includes(comparators[1]) //determines if there needs to be a specical scope
  ) {
    //need to redirect to login and get a callback
    //need specical scope authorization... (user top read)
    //after also get top music info
    spotifyApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUri, //will have to change this later
    });
    let scope = ["user-top"];
    let authorizeURL = spotifyApi.createAuthorizeURL(scope, state); //generated
  } else {
    //only need to authenticate the app
  }
  //at least one paramter has to be a year so following method is always called
  if (!userSpotify.includes(comparators[0])) {
    //this must mean it is a year.... (check if database has it, otherwise call python webscraper)
  }

  if (!userSpotify.includes(comparators[0])) {
  }
};

exports.authorizeSpotifyUser = () => {
  //should only be called if we need user data...
  spotifyApi.authorizationCodeGrant(req.query.code).then(
    //promise function
    (data) => {
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);

      return getUserInformation();
    }
  );
};*/
