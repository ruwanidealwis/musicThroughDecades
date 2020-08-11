let SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi();
let clientId = process.env.CLIENTID;
let clientSecret = process.env.CLIENTSECRET;
let redirectUri = "http://localhost:8000/callback"; //change this when running on heroku
let scopes = ["playlist-read-private", "user-read-email"]; //get the users account and their private playlists
//running locally
if (process.env.PORT == null) {
  clientId = config.clientID;
  clientSecret = config.clientSecret;
  redirectUri = "http://localhost:8000/callback";
}

analyzeComparators = (comparators) => {
  let userSpotify = ["all-time", "6 months", "1 month"];
  if (
    userSpotify.includes(comparators[0]) ||
    userSpotify.includes(comparators[1]) //determines if there needs to be a specical scope
  ) {
    //need to redirect to login and get a callback
    //need specical scope authorization... (user top read)
    //after also get top music info
  }
  //at least one paramter has to be a year so following method is always called
  if (!userSpotify.includes(comparators[0])) {
    //this must mean it is a year.... (check if database has it, otherwise call python webscraper)
  }

  if (!userSpotify.includes(comparators[0])) {
  }
};
