//set up routes
let express = require("express");
let spotifyController = require("../controllers/spotifyController");
var router = express.Router();

router.get("/", (req, res) => {
  //load pain page
  //user will pick two years (or their music to compare from this page)
  res.json({
    status: "success",
    message: "Welcome Music through the decades",
  });
});

router.get("/music/createPlaylist", (req, res) => {
  console.log("hello");
  spotifyController.createPlaylist(req);
});

router.get("/music", (req, res) => {
  console.log(req.session.userTopRead);
  console.log(req.session.id);
  console.log(req.session.type);
  console.log(req.session.userId);
  res.json({
    decade: req.session.decadeStats,
    comparator: req.session.comparator,
  });
});

router.get("/callback", async (req, res) => {
  //should be loading page...
  req.session.comparator = await spotifyController.getUserListeningHabbits(
    req,
    req.session.userTopRead,
    req.session.decade
  );
  res.redirect("/music");
});

router.get("/compare/:comparators", async (req, res) => {
  let userSpotify = ["allTime", "6Months", "1Month"];
  let comparators = req.params.comparators.split("-"); //getting properly formatted comparators
  req.session.decade = comparators[0];
  req.session.decadeStats = await spotifyController.getMusicInformation(
    req.session.decade,
    req
  );

  if (userSpotify.includes(comparators[1])) {
    req.session.type = "user";
    let url = spotifyController.getAuthorizationURL(comparators[1], req);
    res.redirect(url); //now redirects user to authorization... (after successful should return to callback...)
  } else {
    req.session.type = "decade";
    req.session.comparator = await spotifyController.getMusicInformation(
      comparators[1],
      req
    );
    res.redirect("/music");
  }

  //call spotify controller here and from there determine how the database/everything works
});

module.exports = router;
