//set up routes
let express = require("express");
/** @global stores databasetable*/ var databaseTable = require("../controllers/databaseController");
let spotifyController = require("../controllers/spotifyController");
var path = require("path");
var router = express.Router();
var clientURL = process.env.CLIENTURL;

//running locally
if (clientURL == null) clientURL = "http://localhost:3000"; //need to change...(for later)
/**
 * Validate entered values (not very relevant when the front end is implemented)
 * @param {String} comparator - decade being compared
 * @return {boolean} true if it is a valid year to compare, false if else.
 */
let validateValues = (comparator) => {
  let decades = ["1950", "1960", "1970", "1980", "1990", "2000", "2010"];

  if (decades.includes(comparator)) {
    return true;
  } else return false;
};
router.get("/", (req, res) => {
  //load pain page
  //user will pick two years (or their music to compare from this page)
  res.json({
    status: "success",
    message: "Welcome to Music Through The Decades",
  });
});

router.get("/music/createPlaylist", (req, res) => {
  spotifyController.createPlaylist(req).then((url) => {
    res.status(200).send({ url: url });
    (err) => {
      res.send(400).send({ error: "Could not Create Playlist" });
    };
  });
});

router.get("/music", (req, res) => {
  //logic from :https://github.com/finallyayo/music-history/blob/master/server.js
  //res.redirect(`${clientURL}/?authorized=true`);
  res.status(200).json({
    decade: req.session.decadeStats,
    comparator: req.session.comparator,
  });
});

router.get("/login", (req, res) => {
  timeRange = req.query.timeRange;
  let url = spotifyController.getAuthorizationURL(req);
  res.status(200).send({ url: url }); //now redirects user to authorization... (after successful should return to callback...)
});
router.get("/callback", async (req, res) => {
  res.redirect(`${clientURL}/?authorized=true&code=${req.query.code}`);
});

router.get("/compare/:comparators", async (req, res) => {
  let userSpotify = ["allTime", "6Months", "1Month"];

  //session vars
  req.session.token = "";
  req.session.myTopHits = [];
  req.session.top100Hits = [];
  req.session.fullInfoHitArray = [];
  req.session.artistsIdArray = [];
  req.session.songIdArray = [];
  req.session.albumIdArray = [];
  req.session.topArtistIdArray = [];

  await databaseTable.createTempUser(req.session.id);
  let comparators = req.params.comparators.split("-"); //getting properly formatted comparators
  if (userSpotify.includes(comparators[1])) {
    req.session.type = "user";
    let validated = validateValues(comparators[0]);
    if (validated === true) {
      req.session.decade = comparators[0];

      req.session.userTopRead = comparators[1];
      req.session.decadeStats = await spotifyController.getMusicInformation(
        req,
        req.session.decade
      );

      req.session.comparator = await spotifyController.getUserListeningHabbits(
        req,
        res
      );

      await databaseTable.deleteUserSongsFromDatabase(
        req.session.id,
        req.session.decade
      );
      await databaseTable.deleteTempUser(req.session.id);
      res.status(200).redirect("/music");
    } else {
      res
        .status(400)
        .send({ error: "invalid value entered for 1st comparator" });
    }
  } else {
    req.session.decade = comparators[0];
    let validated = validateValues(comparators[0]);
    if (validated === true) {
      req.session.type = "decade";

      let validateSecondComparator = validateValues(comparators[1]);
      if (validateSecondComparator == true) {
        //get all the data...
        req.session.decadeStats = await spotifyController.getMusicInformation(
          req,
          req.session.decade
        );

        //await databaseTable.deleteSongsFromDB(req.session.decade);
        //await databaseTable.deleteArtistsFromDB(req.session.decade);
        req.session.decade2 = comparators[1];
        req.session.comparator = await spotifyController.getMusicInformation(
          req,
          req.session.decade2
        );

        //await databaseTable.deleteSongsFromDB(req.session.decade2);
        //await databaseTable.deleteArtistsFromDB(req.session.decade2);

        await databaseTable.deleteUserSongsFromDatabase(
          req.session.id,
          req.session.decade
        );

        await databaseTable.deleteUserSongsFromDatabase(
          req.session.id,
          req.session.decade2
        );

        await databaseTable.deleteTempUser(req.session.id);

        res.status(200).redirect("/music");
      } else {
        res
          .status(400)
          .send({ error: "invalid value entered for 2nd comparator" });
      }
    } else {
      res
        .status(400)
        .send({ error: "invalid value entered for 1st comparator" });
    }
  }

  /*let validated = validateValues(comparators[0]);

  if (validated === true) {
    req.session.decade = comparators[0];

    req.session.decadeStats = await spotifyController.getMusicInformation(
      req,
      req.session.decade
    );

    if (userSpotify.includes(comparators[1])) {
      res.redirect("/login");
      req.session.type = "user";
      req.session.completed = false;
      req.session.retries = 3; //each request gets 3 tries
      req.session.userTopRead = comparators[1];
      req.session.comparator = await spotifyController.getUserListeningHabbits(
        req,
        res
      );
      req.session.completed == true;
      res.redirect("/music"); //et url = spotifyController.getAuthorizationURL(comparators[1], req);
    } else {
      req.session.type = "decade";
      let validateSecondComparator = validateValues(comparators[1]);
      if (validateSecondComparator == true) {
        req.session.decade2 = comparators[1];
        req.session.comparator = await spotifyController.getMusicInformation(
          req,
          req.session.decade2
        );
        req.session.completed == true;
        res.status(200).redirect("/music");
      } else {
        res
          .status(400)
          .send({ error: "invalid value entered for 2nd comparator" });
      }
    }
  } else {
    res.status(400).send({ error: "invalid value entered for 1st comparator" });
  }

  //call spotify controller here and from there determine how the database/everything works*/
});
router.get("*", (req, res) => {
  //taken from: https://stackoverflow.com/questions/16750524/remove-last-directory-in-url
  let rootPath = __dirname.split(path.sep);
  rootPath.pop();

  //res.sendFile(path.join(rootPath.join(path.sep) + "/client/build/index.html"));
});

module.exports = router;
