let SpotifyWebApi = require("spotify-web-api-node");
let clientId = process.env.CLIENTID;
let clientSecret = process.env.CLIENTSECRET;
let redirectUri = "https://colouryourplaylists.herokuapp.com/callback";
//running locally
if (process.env.PORT == null) {
  clientId = config.clientID;
  clientSecret = config.clientSecret;
  redirectUri = "http://localhost:8000/callback";
}
