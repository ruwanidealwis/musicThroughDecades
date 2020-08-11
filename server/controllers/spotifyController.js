let SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi;
let clientId = process.env.CLIENTID;
let clientSecret = process.env.CLIENTSECRET;
let redirectUri = "http://localhost:8000/callback"; //change this when running on heroku
let scopes = ["playlist-read-private", "user-read-email"]; //get the users account and their private playlists
const db = require("../models/index.js");
//running locally
if (process.env.PORT == null) {
  clientId = config.clientID;
  clientSecret = config.clientSecret;
  redirectUri = "http://localhost:8000/callback";
}

exports.authorizeSpotify = (comparators) => {
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
    var spotifyApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
    });

    // Retrieve an access token.
    spotifyApi.clientCredentialsGrant().then(
      function (data) {
        console.log("The access token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body["access_token"]);
      },
      function (err) {
        console.log(
          "Something went wrong when retrieving an access token",
          err
        );
      }
    );
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
};
