/**
 * Files contain all the helper methods used by the application
 * @author ruwanidealwis
 *
 */
const Papa = require('papaparse');
const fs = require('fs');

/**
 * Validate decade
 * This is an additional check, because input is valdiated by the front end
 * @param {String} decade - decade being compared
 * @return {boolean} true if it is a valid year to compare, false if else.
 */
exports.validateDecade = (decade) => {
  const decades = ['1950', '1960', '1970', '1980', '1990', '2000', '2010'];
  if (decades.includes(decade)) {
    return true;
  } return false;
};

/**
 * Validate user time length;
 * This is an additional check, because input is valdiated by the front end
 * @param {String} decade - decade being compared
 * @return {boolean} true if it is a valid year to compare, false if else.
 */
exports.validateTimeLength = (timeLength) => {
  const timeLengths = ['allTime', '6Months', '1Month'];

  if (timeLengths.includes(timeLength)) {
    return true;
  } return false;
};

/**
 * Adds a delay
 * taken from: https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
 * @param {Number} ms - the length of the relay
 * @return {Promise} resolves after the delay
 */
exports.delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Gets the time range for the top songs according to what the user wants
 * @param {string} comparator - String that indicates which time range the user wants
 * @return {String} returns time range in format compatible for spotify api query
 */
exports.getReadChoice = (comparator) => {
  switch (comparator) {
    case 'allTime':
      return 'long_term';
    case '6Months':
      return 'medium_term';
    case '1Month':
      return 'short_term';
    default:
      return 'long_term';
  }
};

/**
 * Formats webscraped data
 * @summary Formats webscraped data into an object with specified, track,year, and artist keys
 * @param {array} data - Data scraped from the web
 * @return  {Array} Returns object array with information extracted (track, artists, year)
 */
const formatData = (data) => {
  const allHitsArray = [];
  const songIDArray = [];
  const artistsIDArray = [];
  for (const hit of data) {
    allHitsArray.push({
      track: hit[0],
      year: hit[2],
      artists: hit[5].split(',').length,
      artistRank: hit[3],
    }); // because of the way the website is structured (this may not be exactly correc t)

    hit[5].split(',').forEach((ID) => artistsIDArray.push(ID));

    songIDArray.push(hit[4]);
  }
  return {
    allHitsArray, songIDArray, artistsIDArray,
  };
};

/**
 * gets information about top songs for each decade from CSV files
 * @param {string} decade - decade to determine which csv file to read
 * @returns {Object} - song & artist information about the top 100 songs for each decade
 */
exports.getCSVData = async (decade) => {
  const file = fs.createReadStream(`dataFiles/${decade}.csv`);
  const artistFile = fs.createReadStream(`dataFiles/${decade}Artists.csv`);
  // adapted from: https://github.com/mholt/PapaParse/issues/752
  const songReading = (filetoParse) => new Promise((resolve) => {
    Papa.parse(filetoParse, {
      dynamicTyping: true,
      complete: async (results) => {
        const csvData = formatData(results.data);

        resolve(csvData);
      },
    });
  });
  const topArtistIDArray = [];
  const artistReading = (filetoParse) => new Promise((resolve) => {
    Papa.parse(filetoParse, {
      delimiter: '|',
      complete(results) {
        for (const artist of results.data) {
          topArtistIDArray.push(artist[1]);
        }

        resolve(topArtistIDArray);
      },
    });
  });

  const csvData = await songReading(file);
  csvData.topArtistIDArray = await artistReading(artistFile);
  return csvData;
};

/**
* converts first letter to capital(hi ===> Hi)
* taken from: https://dzone.com/articles/capitalize-first-letter-string-javascript
* @summary If the description is long, write your summary here.Otherwise, feel free to remove this.
* @param { String } string - string to convert to capital
* @return { String } String with first letter capital
*/
exports.jsUcfirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

/**
 * check if the user is authorized
 * @param {Request} req express request object
 * @return {Boolean} true if authorized, false if not
 */
exports.isAuthorized = (req) => {
  // TODO check if there is a way to verify token itself (like a jwt)
  const authHeader = req.header('Authorization');

  const refreshToken = req.header('RefreshToken');
  if (authHeader === undefined || refreshToken === undefined) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  if (token === '' || refreshToken === '') {
    return false;
  }
  return true;
};
