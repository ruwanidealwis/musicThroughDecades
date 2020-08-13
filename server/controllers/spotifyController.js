/************* module imports  */
let SpotifyWebApi = require("spotify-web-api-node");
config = require("../../variableConfig.js");
const db = require("../../models/index.js");
var { PythonShell } = require("python-shell");
var top100Hits;
var fullInfoHitArray = [];
var songIdArray = [];
/********* variable declaration */
var spotifyApi;
var clientId = process.env.CLIENTID;
var clientSecret = process.env.CLIENTSECRET;

/*********************************************** SET BASIC INFO (if running locally...) *********************************/
if (process.env.PORT == null) {
  console.log("local");
  redirectUri = "http://localhost:8000/callback";
}

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
  return new Promise(function (resolve, reject) {
    spotifyApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
    });
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
    let splitHit = hit.replace("'", "").split(" - ");
    let artists = splitHit[1].split("&");
    //console.log(splitHit[0]);
    allHitsArray.push({ track: splitHit[0], artist: artists[0] }); //because of the way the website is structured (this may not be exactly correc t)
  });

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
        //console.log(data.body.tracks.items || trackObject.track);

        return data.body.tracks.items[0];
      },
      function (err) {
        console.error(err);
        return err;
      }
    )
    .then((data) => {
      //format array properly...
      //console.log(data);
      let artists = [];
      data.artists.forEach((artist) => {
        artists.push(artist.name);
      });
      let object = {
        id: data.id,
        name: data.name,
        release: data.album.release_date,
        image: data.album.images[0].url,
        artists: artists,
        popularity: data.popularity,
      };
      fullInfoHitArray.push(object);
      songIdArray.push(data.id);

      //console.log(object);
    });
};
getSongInformation = async function () {
  for (const trackObject of top100Hits) {
    //console.log(trackObject);
    await getBasicSongInfo(trackObject);
  } //waits till promise is resolved (this maintains order)
  console.log("done");
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
  console.log(returnData);
  let i = 0;
  fullInfoHitArray.forEach((songObject) => {
    songObject.danceability = returnData[i].danceability;
    songObject.key = returnData[i].key;
    songObject.mode = returnData[i].mode;
    songObject.valence = returnData[i].valence;
    songObject.speechiness = returnData[i].speechiness;
    songObject.tempo = returnData[i].tempo;
    i++;
  });
  //waits till promise is resolved (this maintains order)
  console.log("done");
};
exports.getMusicInformation = async function (comparator) {
  //only called when it is a decade...
  //need to check if database has the data...

  const amount = await db.eighties.count();
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
        console.log(fullInfoHitArray);
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
