//set up routes
let express = require("express");
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
      result[comparators[0].length - 1] +
      result[comparators[0].length - 2] +
      "s"; //format it correctly (ex: 1980 would become 80s)
  } else {
    //means it is one of the spotify calls;
    //need to redict to login page
  }
  if (years.includes(comparators[0])) {
    //second year could possibly aslo be a year
    let result = comparators[1].split("");
    comparator2 =
      result[comparators[1].length - 1] +
      result[comparators[1].length - 2] +
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

router.post("/:comparators", (req, res) => {
  let comparators = determineYears(req.params.comparators.split("-")); //getting properly formatted comparators

  //call spotify controller here and from there determine how the database/everything works
});

module.exports = router;
