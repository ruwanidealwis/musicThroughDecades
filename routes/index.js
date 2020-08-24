//set up routes
let express = require("express");
let spotifyController = require("../controllers/spotifyController");
var router = express.Router();
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
  console.log("hello");
  spotifyController.createPlaylist(req).then((url) => {
    res.send(200).send(url);
    (err) => {
      res.send(400).send({ error: "Could not Create Playlist" });
    };
  });
});

router.get("/music", (req, res) => {
  console.log(req.session.userTopRead);
  console.log(req.session.id);
  console.log(req.session.type);
  console.log(req.session.userId);
  res.status(200).json({
    decade: req.session.decadeStats,
    comparator: req.session.comparator,
  });
});

router.get("/callback", async (req, res) => {
  //loaded after the user authenticates
  //should be loading page...
  req.session.retries = 3; //each request gets 3 tries
  req.session.comparator = await spotifyController.getUserListeningHabbits(
    req,
    req.session.userTopRead,
    req.session.decade,
    req.session.retries
  );
  res.redirect("/music");
});

router.get("/compare/:comparators", async (req, res) => {
  let userSpotify = ["allTime", "6Months", "1Month"];
  let comparators = req.params.comparators.split("-"); //getting properly formatted comparators
  let validated = validateValues(comparators[0]);
  console.log(validated);
  if (validated === true) {
    req.session.decade = comparators[0];

    req.session.decadeStats = await spotifyController.getMusicInformation(
      req,
      req.session.decade
    );

    if (userSpotify.includes(comparators[1])) {
      req.session.type = "user";

      let url = spotifyController.getAuthorizationURL(comparators[1], req);
      res.redirect(url); //now redirects user to authorization... (after successful should return to callback...)
    } else {
      req.session.type = "decade";
      let validateSecondComparator = validateValues(comparators[1]);
      if (validateSecondComparator == true) {
        req.session.decade2 = comparators[1];
        req.session.comparator = await spotifyController.getMusicInformation(
          req,
          req.session.decade2
        );
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

  //call spotify controller here and from there determine how the database/everything works
});

module.exports = router;
