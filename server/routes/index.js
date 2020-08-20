//set up routes
let express = require("express");
let spotifyController = require("../controllers/spotifyController");
var router = express.Router();

let determineYears = (comparators) => {
  /**
   * formats the years properly so the appropriate function can be called
   * @param {Array} comparators - gives the two years (or the spotify data user wants to compares)
   * @return {Array} Array of the two comparators properly formatted
   */

  let comparator1 = "";
  let comparator2 = "";

  //function determiens the two years (or user data) that is being compared
  let years = ["1960", "1970", "1980", , "1990", "2000", "2010"];
  if (years.includes(comparators[0])) {
    let result = comparators[0].split("");
    comparator1 =
      result[comparators[0].length - 2] +
      result[comparators[0].length - 1] +
      "s"; //format it correctly (ex: 1980 would become 80s)
  } else {
    //means it is one of the spotify calls;
    //need to redict to login page
  }
  if (years.includes(comparators[0])) {
    //second year could possibly aslo be a year
    let result = comparators[1].split("");
    comparator2 =
      result[comparators[1].length - 2] +
      result[comparators[1].length - 1] +
      "s"; //format it correctly (ex: 1980 would become 80s)
  } else {
    //means it is one of the spotify calls;
    //need to redict to login page
  }
  let returnArray = [comparator1, comparator2];
  return returnArray;
};
router.get("/", (req, res) => {
  //load pain page
  //user will pick two years (or their music to compare from this page)
  res.json({
    status: "success",
    message: "Welcome Music through the decades",
  });
});

router.get("/callback", (req, res) => {
  res.send("ola");
  //should be loading page...
  spotifyController.getUserListeningHabbits(req);
});

router.get("/:comparators", async (req, res) => {
  let comparators = req.params.comparators.split("-"); //getting properly formatted comparators
  console.log(comparators);
  let userSpotify = ["allTime", "6Months", "1Month"];
  if (!userSpotify.includes(comparators[0], req, res)) {
    //this means the comparator is a decade (does not need user authentication)
    //call spotify controller method to get year data
    req.session.data = await spotifyController.getMusicInformation(
      comparators[0],
      req
    );
    res.send(req.session.data);
  } else {
    let url = spotifyController.getAuthorizationURL(comparators[0]);
    res.redirect(url); //now redirects user to authorization... (after successful should return to callback...)
  }
  if (!userSpotify.includes(comparators[1])) {
    //same as above
    //call spotify controller method to get year data
    // spotifyController.getMusicInformation(comparators[1], req); //will redirect with session objects...
  } else {
  }

  //call spotify controller here and from there determine how the database/everything works
});

module.exports = router;
