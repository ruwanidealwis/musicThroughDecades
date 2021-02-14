// manipulate DB
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const utils = require('../utils/utils');
/** @global */ const db = require('../models/index.js');

/** ****** UPDATES DATABASE_ ******* */

/**
* Deletes all temporary user artists from database
*  (means these artists are not the top artists of the decade, but top  songs of the user)
* @param {Artist} artist Object containing information about artist
* @param {String} sessionID the id of the current session
*/
const deleteUserArtistsFromDatabase = async (artist, sessionID) => {
  try {
    const otherUsers = await db.Artist.findByPk(artist.id, {
      include: [{ model: db.tempUser }, { model: db.Songs }],
    });

    // record still exists
    if (otherUsers != null) {
      // only user associated with artist
      if (otherUsers.tempUsers.length === 1) {
        // remove association between current user and artist
        if (otherUsers.tempUsers[0].sessionID === sessionID) {
          db.Artist.destroy({
            where: { id: artist.id },
          });
        }
      }
    }
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * Creates a temporary user for the duration of session
 * @param {sessionID} sessionID - id of the current session
 * @throws error is can't create a new entry
 */
exports.createTempUser = async (sessionID) => {
  try {
    await db.tempUser.create({
      sessionID,
    });
  } catch (e) {
    throw new Error({ error: e });
  }
};

/**
 * creates a permanant artist in the database (this artist had a top song in one of the decades)
 * @param {Artist} artist an Object containing informatin about the artist
 * @param {int} decadeID the decade that the artist belongs to
 *  @param {Object} song the song that was created in the database that the artist sang
 * @param {Object} songObj information about the song
 * @throws error if adrist cannot be added
 */
const addPermanantArtists = async (
  artist,
  decadeId,
  song,
  songObj,
  sessionID,
) => {
  try {
    const dbArtist = await db.Artist.findOne({
      attributes: ['id'],
      include: [{ model: db.Decade }],
      where: {
        name: artist.name,
        imageURL: artist.image,
      }, // TODO CHANGE THIS}
      raw: true,
    });
    if (dbArtist === null) {
    // create new artist and then add it to db, and also its associations
      const newArtist = await db.Artist.create({
        name: artist.name,
        imageURL: artist.image,
        genres: artist.genres, // TODO CHANGE THIS
      });
      // create an association with decade, and song
      await song.addArtist(newArtist);

      await db.DecadeArtists.create({
        artistId: newArtist.id,
        decadeId,
        rank: songObj.artistRank,
      });

      // TODO CHECK why???
      await db.UserArtists.findOrCreate({
        where: {
          sessionID,
          artistId: newArtist.id,
        },
        sessionID,
        artistId: newArtist.id,
      });
    } else {
      // already created we just add an extra association
      await db.SongArtists.create({
        artistId: dbArtist.id,
        songId: song.id,
      });

      // TODO CHECK why???
      await db.UserArtists.findOrCreate({
        where: {
          sessionID,
          artistId: dbArtist.id,
        },
        sessionID,
        artistId: dbArtist.id,
      });

      // determine if the artist is associated with the current decade being searched
      const currentDecades = await db.Artist.findOne({
        attributes: ['id'],
        where: { name: dbArtist.name, imageURL: dbArtist.image },
        include: [{ model: db.Decade, where: { id: decadeId } }],
        raw: true,
      });

      if (currentDecades === null) {
      // add new decade association
        await db.DecadeArtists.create({
          artistId: dbArtist.id,
          decadeId,
          rank: songObj.artistRank,
        });
      }
    }
  } catch (e) {
    throw new Error({ error: e });
  }
};

/** *** QUERIES DATABASE_ ******* */

/**
 * returns true if the music data for the specific decade is in the database
 * @param {string} decade the decade being searched
 * @return {boolean} true if data already exists, false if not
 * @throws error if query fails
 */
exports.decadeDataAvailable = async (decade) => {
  try {
    const decadeData = db.Decade.findOne({
      where: { name: decade },
      include: [{ model: db.Songs }],
    });
    if (decadeData.Songs.length === 100) {
      return true;
    }
    return false;
  } catch (e) {
    throw new Error({ error: e });
  }
};

/**
 * Adds the song to the database
 * @param {Object} songObjects an Object containing the details of the song
 * @param {Number} decade specifies the decade the song was created in
 * @param {Number} index specifies the rank
 * @throws error if method fails to add to database
 */
exports.addSongToDatabase = async (songObjects, decade, index, sessionID) => {
  try {
    const dbDecade = await db.Decade.findOne({
      attributes: ['id'],
      where: { name: decade },
      raw: true,
    });

    const song = await db.Songs.findOrCreate({
      where: {
        spotifyId: songObjects.spotifyId,
      },
      defaults: {
        name: songObjects.name,
        yearOfRelease: songObjects.release,
        imageURL: songObjects.image,
        valence: songObjects.audioData.valence,
        danceability: songObjects.audioData.danceability,
        popularity: songObjects.audioData.popularity,
        key: songObjects.audioData.key,
        mode: songObjects.audioData.mode,
        speechiness: songObjects.audioData.speechiness,
        tempo: songObjects.audioData.tempo,
        acousticness: songObjects.audioData.acousticness,
        energy: songObjects.audioData.energy,
        instrumentalness: songObjects.audioData.instrumentalness,
        rank: index,
        decadeId: dbDecade.id,
        spotifyId: songObjects.spotifyId,
        previewURL: songObjects.previewURL,
      },
    });

    // TODO check why??
    await db.UserSongs.create({
      sessionID,
      songId: song[0].dataValues.id,
    });
    // newly created...

    for (const artist of songObjects.artists) {
      // call helper method
      // TODO why??
      if (song[1] === true) {
        await addPermanantArtists(
          artist,
          dbDecade.id,
          song[0],
          songObjects,
          sessionID,
        );
      }
    }
  } catch (e) { throw new Error({ error: e }); }
};

/**
 * Creates the specific user song (helper method in addUserSongs) (and artist)
 * @param {Object} songObjects an Object containing the details of the song
 * @param {Array} dateArray array containing the date the song was released
 * @param {Number} index specifies the rank the song was created in
 * @param {String} sessionID the id of the current session
 * @throws error if song and/or artist cannot be added to the database
 */
const createUserEntry = async (songObjects, dateArray, sessionID, index) => {
  try {
    const userSong = await db.Songs.create({
      name: songObjects.name,
      yearOfRelease: dateArray[0],
      imageURL: songObjects.imageUrl,
      valence: songObjects.valence,
      danceability: songObjects.danceability,
      popularity: songObjects.popularity,
      key: songObjects.key,
      mode: songObjects.mode,
      speechiness: songObjects.speechiness,
      tempo: songObjects.tempo,
      acousticness: songObjects.acousticness,
      energy: songObjects.energy,
      instrumentalness: songObjects.instrumentalness,
      spotifyId: songObjects.spotifyId,
      previewURL: songObjects.previewURL,
      temp: true, // song is temporary and no decade Id.... (we need to delete it)
    });
    for (const artist of songObjects.artists) {
      const dbArtist = await db.Artist.findOne({
        attributes: ['id'],
        where: {
          name: artist.name,
          imageURL: artist.image,
        }, // TODO CHANGE THIS}
        raw: true,
      });
      let createArtistId;
      if (dbArtist === null) {
        // create new artist and then add it...
        const newArtist = await db.Artist.create({
          // where: { name: artist.name, imageURL: artist.imageURL },
          name: artist.name,
          imageURL: artist.image,
          genres: artist.genres,
          temp: true,
        });
        // create an association with decade
        await userSong.addArtist(newArtist, {
          through: { temp: true },
        });
        createArtistId = newArtist.id;
      } else {
        // artist in the db, just add another association to the song
        await db.SongArtists.create({
          artistId: dbArtist.id,
          songId: userSong.id,
        });
        createArtistId = dbArtist.id;
      }
      // add user association
      const create = await db.UserArtists.findOrCreate({
        where: {
          sessionID,
          artistId: createArtistId,
        },

        defaults: {
          sessionID,
          artistId: createArtistId,
          temp: true,
        },
      });

      // newly created association
      if (create[1] === false) {
        // TODO what is the point of this?
        const existingArtist = await db.UserArtists.findOne({
          where: { sessionID, artistId: createArtistId },
        });

        existingArtist.temp = true;
        existingArtist.save(); // normal save not wowkring workaround for now...
      }
    }
    // add an association with user songs
    await db.UserSongs.create({
      sessionID,
      songId: userSong.id,
      rank: index,
    }); // add this to user and session ID to the associated table
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * @summary Adds the user song to the database, temproray data and the song removed later
 * @param {Object} songObjects an Object containing the details of the song
 * @param {Number} index specifies the rank the song was created in
 * @param {String} sessionID the id of the current session
 */
exports.addUserSongToDatabase = async (songObjects, index, sessionID) => {
  try {
  // we first have to check if this song exists...
    const dateArray = songObjects.release.split('-'); // get the date (we only care about year, not exact date)
    const song = await db.Songs.findOne({
      attributes: ['id'],
      where: {
        spotifyId: songObjects.spotifyId, // spotifyId for each song is unique!
      },
      include: [{ model: db.Artist }],
    });

    if (song == null) {
    // song didn't exist before
      await createUserEntry(songObjects, dateArray, sessionID, index);
    } else {
    // create a manual association with UserSong and for all the artists aswell

      // TODO check why??
      song.temp = true;
      song.save();

      const userSong = await db.UserSongs.findOrCreate({
        where: { sessionID, songId: song.id },
        defaults: {
          sessionID,
          songId: song.id,
          rank: index,
        },
      });

      // TODO false means??
      if (userSong[1] === false) {
        const createdSong = await db.UserSongs.findOne({
          where: { sessionID, songId: song.id },
        });

        createdSong.rank = index;
        createdSong.save();
      }

      for (const artist of song.Artists) {
      // association could have been created with another song
        await db.UserArtists.findOrCreate({
          where: { artistId: artist.id, sessionID },
          defaults: { temp: true, sessionID, artistId: artist.id },
        });
        // TODO why??

        const existingArtist = await db.UserArtists.findOne({
          where: { sessionID, artistId: artist.id },
        });

        existingArtist.temp = true;
        existingArtist.save();
      }
    }
  } catch (e) {
    throw new Error({ error: e });
  }
};

/**
 * @summary Deletes all temporary user songs from databas
 * @param {String} sessionID the id of the current session
 * @throws error if fail to delete the songs
 */
exports.deleteUserSongsFromDatabase = async (sessionID) => {
  try {
  // after we get all the nescessary information...the song will be deleted
    const possibleSongs = await db.Songs.findAll({
      attributes: ['name', 'id'],
      where: { [Op.or]: [{ temp: true }] }, // only user songs are temp
      include: [
        { model: db.tempUser },
        { model: db.Artist },

      ],
    });

    for (const song of possibleSongs) {
      const songId = song.id;

      // this avoids the case where two users are using the app at the same time,
      // and both have the same top song
      if (song.tempUsers.length === 1) {
        if (song.tempUsers[0].sessionID === sessionID) {
          for (const artist of song.Artists) {
          // delete arists associated with the song (if valid)
            await deleteUserArtistsFromDatabase(artist, sessionID);
          }
          await db.Songs.destroy({
            where: { id: songId },
          });
        }
      }
    }
  } catch (e) {
    throw new Error({ error: e });
  }
};

/**
 * deletes the temporary user from the database
 * @param {string} sessionID = current session ID of the user
 * @throws an error if failed to deelte user
 */
exports.deleteTempUser = async (sessionID) => {
  try {
    await db.tempUser.destroy({ where: { sessionID } }); // delete it from userDB
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets the number of top songs released in the decade
 * @param {string} decade decade to be queried
 * @param {string} year  year to be queries
 * @return {number} the number of songs from that year in the top 100
 */
const getSongDistributionByYear = (decade, year) => {
  try {
    const decadeData = db.Decade.findOne({
      where: { name: decade },
      include: [{ model: db.Songs, where: { yearOfRelease: year } }],
    });
    return decadeData.Songs.length;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * returns the ID for specific decade given the string
 * @param {string} decade the decade in string
 * @returns id of decade in db
 * @throws error if query fails
 */
const getDecadeID = async (decade) => {
  try {
    const dbDecade = await db.Decade.findOne({
      attributes: ['id'],
      raw: true,
      where: { name: decade },
    });
    return dbDecade.id;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * Gets the top artist of the decade
 * @param {string} decade decade to be queried
 * @returns {Array} of artists
 * @throws error if query fails
 */
const getTopArtistsByRank = async (decade) => {
  try {
    const artistData = await db.Decade.findAll({
      where: { name: decade },

      include: [
        {
          model: db.Artist,
          attributes: ['name', 'imageURL', 'genres'],

          group: ['name', 'imageURL'],
          through: { attributes: [] },
        },
      ],
      order: [Sequelize.literal('"Artists->DecadeArtists"."rank" asc')],
    });
    const topArtistsArray = [];
    let limit = 0;
    for (const artist of artistData[0].Artists) {
      if (limit < 10) {
        topArtistsArray.push({
          name: artist.name,
          image: artist.imageURL,
          genres: artist.genres,
        });
      } else {
        break;
      }
      limit += 1;
    }
    return topArtistsArray;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets average value for each audio feature
 * @param {string} feature - audio feature
 * @param {string} decade - relevant decade
 * @param {number} start  - start year
 * @param {number} end  - end year
 * @returns {number} average value for each feature between start and end
 * @throws an error if the query fails
 */
const getAverageValue = async (feature, decade, start, end) => {
  try {
    const decadeID = await getDecadeID(decade);
    const song = await db.Songs.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col(feature)), 'average']],
      where: {
        decadeId: decadeID,
        yearOfRelease: { [Op.between]: [start, end] },
      },
      raw: true,
    });
    return song.average;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * Gets the songs with the top feature (most danceable etc)
 * @param {*} feature feature to be queried
 * @param {*} ordering ascending or desceding order
 * @param {*} limit  number of items returned
 * @param {*} decade  decade to be queried
 * @param {*} start start year
 * @param {*} end  end year
 * @returns {Array} of songs
 * @throws an error if the query fails
 */
const getTopFeaturesForDecade = async (
  feature,
  ordering,
  limit,
  decade,
  start,
  end,
) => {
  try {
    const objArray = [];
    const decadeInfo = await db.Decade.findOne({
      where: { name: decade },
      include: [
        {
          attributes: [
            'name',
            feature,
            'yearOfRelease',
            'rank',
            'id',
            'imageURL',
            'previewURL',
          ],
          required: false,
          model: db.Songs,
          order: [[feature, ordering]],
          limit,
          where: { yearOfRelease: { [Op.between]: [start, end] } },
        },
      ],
    }); // only have one, name is unique

    for (const songs of decadeInfo.Songs) {
    // cant do it in original query, breaks it
      const songArtists = await db.Songs.findByPk(songs.id, {
        include: [{ model: db.Artist, attributes: ['name'] }],
      });
      const artistsArray = [];
      songArtists.Artists.forEach((artist) => artistsArray.push(artist.name));

      const obj = {
        name: songs.name,
        year: songs.yearOfRelease,
        rank: songs.rank,
        [feature]: songs[feature],
        image: songs.imageURL,
        artists: artistsArray,
        previewURL: songs.previewURL,
      };
      objArray.push(obj);
    }
    return objArray;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets description of the decade
 * @param {string} decade decade to be queried
 * @returns {string} the description
 * @throws an error if the query fails
 */
const getDecadeDiscription = async (decade) => {
  try {
    const decadeData = await db.Decade.findOne({
      attributes: ['description'],
      raw: true,
      where: { name: decade },
    });
    return decadeData.description;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets top songs for a decade from the db
 * @param {string} decade decade to be queried
 * @returns {Array} of the top Songs
 * @throws an error if the query fails
 */
const getTopSongs = async (decade) => {
  try {
    const topSongArray = [];
    const decadeID = await getDecadeID(decade);

    const decadeSongs = await db.Songs.findAll({
      attributes: ['name', 'rank', 'imageURL', 'yearOfRelease', 'previewURL'],
      where: { decadeId: decadeID },
      include: { model: db.Artist },
      limit: 20,
      order: [['rank', 'ASC']],
    });

    for (const song of decadeSongs) {
      const artists = [];

      for (const artist of song.Artists) {
        artists.push(artist.name);
      }
      topSongArray.push({
        name: song.name,
        rank: song.rank,
        year: song.yearOfRelease,
        image: song.imageURL,
        artists,
        previewURL: song.previewURL,
      });
    }
    return topSongArray;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets the distrubtion for each feature for a specific decade
 * @param {string} decade decade to be queried
 * @param {string} feature feature being queried (danceability, valence etc)
 * @returns {Array} of the top Songs
 * @throws an error if the query fails
 */
const getFeatureDistribution = async (decade, feature) => {
  try {
    const decadeID = await getDecadeID(decade);

    const songs = await db.Songs.findAll({
      where: { decadeId: decadeID, [feature]: { [Op.or]: { [Op.ne]: -1 } } },
      attributes: [
        feature,
        [Sequelize.fn('COUNT', Sequelize.col(feature)), 'count'],
      ],
      group: feature, // group by feature
      raw: true, // get raw data
    });
    return songs;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets the most common genres for a specific decade
 * @param {string} decade decade to be queried
 * @returns {Array} of the genres and its makeup
 * @throws an error if the query fails
 */
const getMostCommonGenres = async (decade) => {
  try {
    const decadeID = await getDecadeID(decade);
    // TODO find ORM query
    const commonGenreData = db.sequelize
      .query(
        `select
            count(x.genre),
            genre 
          from
            (
                select
                  unnest(genres) as genre,
                  name 
                from
                  "Artists" 
                  inner join
                      "DecadeArtists" 
                      on "DecadeArtists"."artistId" = "Artists"."id" 
                where
                  "decadeId" = ${decadeID}
            )
            as x 
          group by
            x.genre 
          order by count desc
          limit 10`,
        {
          model: db.Decade,
          mapToModel: true, // pass true here if you have any mapped fields
          raw: true,
        },
      );
    return commonGenreData;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * Gets the top artist for a decade
 * @param {string} decade decade to be queried
 * @param {number} limit number of items to return
 * @throws an error if the query fails
 */
const getTopArtists = async (decade, limit) => {
  try {
    const decadeID = getDecadeID(decade);

    // TODO check later, couldnt get sequelize query to work
    const topArtistData = await db.sequelize.query(
      `SELECT
            "Decade"."id",
            "Artists"."name" AS "Artists.name",
            "Artists"."imageURL" AS "Artists.imageURL",
              "Artists"."genres" AS "Artists.genres",
            COUNT("Artists -> Songs"."id") AS "Artists.Songs.count" 
          FROM
            "Decades" AS "Decade" 
            LEFT OUTER JOIN
                (
          ( "DecadeArtists" AS "Artists -> DecadeArtists" 
                  INNER JOIN
                      "Artists" AS "Artists" 
                      ON "Artists"."id" = "Artists -> DecadeArtists"."artistId") 
                  INNER JOIN
                      (
                        "SongArtists" AS "Artists -> Songs -> SongArtists" 
                        INNER JOIN
                            "Songs" AS "Artists -> Songs" 
                            ON "Artists -> Songs"."id" = "Artists -> Songs -> SongArtists"."songId"
                      )
                      ON "Artists"."id" = "Artists -> Songs -> SongArtists"."artistId" 
                      AND "Artists -> Songs"."decadeId" = ${decadeID}
                )
                ON "Decade"."id" = "Artists -> DecadeArtists"."decadeId" 
          WHERE
            "Decade"."id" = ${decadeID}
          GROUP BY
            "Decade"."id",
            "Artists"."id" 
          ORDER BY
            "Artists.Songs.count" desc
            LIMIT ${limit}`,
      {
        model: db.Decade,
        mapToModel: true, // pass true here if you have any mapped fields
        raw: true,
      },
    );
    const topArtists = [];
    for (const artist of topArtistData) {
      topArtists.push({
        name: artist['Artists.name'],
        hits: artist['Artists.Songs.count'],
        image: artist['Artists.imageURL'],
        genres: artist['Artists.genres'],
      });
    }
    return topArtists;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets average value of feature data
 * @param {string} sessionID - sessionID of current user
 * @param {*} feature  - feature to be queried
 * @returns {number} the average value for that feature
 * @throws an error if the query fails
 */
const getUserAverageFeature = async (sessionID, feature) => {
  try {
    const userData = await db.tempUser.findAll({
      attributes: [
        'sessionID',
        [Sequelize.fn('AVG', Sequelize.col(`Songs.${feature}`)), 'average'],
      ],

      where: { sessionID },
      include: {
        model: db.Songs,
        as: 'Songs',
        where: { temp: true },
        raw: true,
        attributes: [],
        through: { attributes: [] },
      },
      group: ['tempUser.id'],
      raw: true,

    });
    return userData[0].average;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets the breakdown of distrubtion for each feature (+ year)
 * @param {string} sessionID - sessionID of current user
 * @param {*} feature = feature being queried
 * @returns {Array} highlighting the distrubtion
 * @throws error if query fails
 * ex: for mode it is [1-numberOfSongs, 0-numberofSongs]
 * ex: for yearOfRealase it is [1960s;5,1980s-2]
 */
const getUserDistribution = async (sessionID, feature) => {
  try {
    const userSongs = await db.tempUser
      .findAll({
        attributes: [
          `Songs.${feature}`,
          [Sequelize.fn('Count', Sequelize.col(`Songs.${feature}`)), 'count'],
        ],

        where: { sessionID },
        include: {
          model: db.Songs,
          as: 'Songs',
          where: { temp: true },
          raw: true,
          attributes: [],
          through: { attributes: [] },
        },
        group: [`Songs.${feature}`],
        raw: true,

      // order: [[db.UserSongs, "createdAt", "DESC"]],
      });
    let decadeDistribution = userSongs;

    // TODO check if its breaking
    if (feature === 'yearOfRelease') {
    // specifically counts how many songs belong in a decade
      decadeDistribution = {};
      for (const featureValue of userSongs) {
      // `${featureValue.yearOfRelease - (featureValue.yearOfRelease % 10)}'s` gets decade
        decadeDistribution[
          `${featureValue.yearOfRelease - (featureValue.yearOfRelease % 10)}'s`
        ] += featureValue.count;
      }
    }

    return decadeDistribution;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets reccomendations from a specific decade based on user's habbits
 * @param {string} decade = decade being queried
 * @param {*} infoObj - information about the user's listening habbits
 * @returns {Array} songs that match listening habits
 * @throws an error if query fails
 */
const getSongReccomendations = async (decade, infoObj) => {
  try {
    const decadeID = await getDecadeID(decade);
    const songs = await db.Songs.findAll({
      attributes: ['name', 'imageURL', 'spotifyId'],
      include: [{ model: db.Artist }],
      where: {
        decadeId: decadeID,

        [Op.and]: {
          valence: {
            [Op.between]: [infoObj.valence - 0.22, infoObj.valence + 0.22],
          },
          energy: {
            [Op.between]: [infoObj.energy - 0.22, infoObj.energy + 0.22],
          },
          danceability: {
            [Op.between]: [
              infoObj.danceability - 0.22,
              infoObj.danceability + 0.22,
            ],
          },
          tempo: { [Op.between]: [infoObj.tempo - 34, infoObj.tempo + 34] },
        },
      },
    });
    const reccomendationsArray = [];

    for (const song of songs) {
      const artists = [];
      for (const artist of song.Artists) {
        artists.push(artist.name);
      }
      reccomendationsArray.push({
        name: song.name,
        artists,
        image: song.imageURL,
        spotifyId: song.spotifyId,
      });
    }
    return reccomendationsArray;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets the user's favourite genres
 * @param {string} sessionID - sessionID of current user
 * @returns {array} of popular genres
 * @throws an error if query fails
 */
const userMostPopularGenres = async (sessionID) => {
  try {
    // TODO fix! - can't figure out sequelize ORM query
    const popularGenres = await db.sequelize
      .query(
        `  select
                genre,
                count(x.genre) 
              From
                (
                    SELECT
                      unnest(genres) as genre 
                    from
                      "Artists" 
                      inner join
                          "UserArtists" 
                          on "UserArtists"."artistId" = "Artists"."id" 
                    where
                      "sessionID" ='${sessionID}' AND
                      "UserArtists"."temp" =true
                )
                as x 
              group by
                x.genre 
              order by
                count desc limit 10`,
        {
          model: db.UserArtists,
          mapToModel: true, // pass true here if you have any mapped fields
          raw: true,
        },
      );
    return popularGenres;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * gets user's top artist (by the number of songs)
 * @param {*} sessionID - current sessionID of user
 * @returns {Array} of the users top songs
 * @throws an error if query fails
 */
const getMostHits = async (sessionID) => {
  try {
    const userArtists = await db.UserArtists.findAll({
      where: { sessionID, temp: true },
      include: [
        {
          model: db.Artist,
          as: 'Artist',
          attributes: ['name', 'imageURL', 'genres'],
          include: [
            {
              model: db.Songs,
              where: { temp: true },
              attributes: ['name'],
              include: [
                {
                  model: db.tempUser,
                  where: { sessionID },
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
      ],
    });

    const artistArray = [];

    for (const UserArtists of userArtists) {
      artistArray.push({
        name: UserArtists.Artist.name,
        hits: UserArtists.Artist.Songs.length,
        image: UserArtists.Artist.imageURL,
        genres: UserArtists.Artist.genres,
      });
    }
    artistArray.sort((a, b) => b.hits - a.hits); // TODO figure out how to force sequelize to order
    return artistArray;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * Gets the top songs for each feature for a specific user, and feature also includes rank
 * @param {*} sessionID - sessionID of the current user
 * @param {*} feature - feature that is queried
 * @param {*} order - sorted in ascending or descding
 * @param {*} limit - number of items to return
 */
const getUserTopFeatures = async (sessionID, feature, order, limit) => {
  try {
    let orderArray = [Sequelize.literal(`"Songs"."${feature}" ${order}`)];
    let attributes = `Songs.${feature}`;
    if (feature === 'rank') {
      orderArray = [
        Sequelize.literal(`"Songs->UserSongs"."${feature}" ${order}`),
      ];
    }
    attributes = `Songs->UserSongs"."${feature}`;
    const userData = db.tempUser
      .findAll({
        attributes: ['sessionID', attributes],
        where: { sessionID },
        include: [
          {
            model: db.Songs,
            where: { temp: true },
            raw: true,
            include: [{ model: db.Artist }],
          },
        ],

        order: [orderArray],

        // order: [[db.UserSongs, "createdAt", "DESC"]],
      });

    const topSongs = [];

    let i = 1;

    for (const song of userData[0].Songs) {
      const artists = [];
      for (const artist of song.Artists) {
        artists.push(artist.name);
      }

      topSongs.push({
        name: song.name,
        year: song.yearOfRelease,
        artists,
        [feature]: song[feature] === null ? i : song[feature],
        image: song.imageURL,
        previewURL: song.previewURL,
      });
      if (i === limit) break;
      i += 1;
    }
    return topSongs;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};

/**
 * Gets the decade statistics (valence, danceability) etc. from the database
 * @param {string} decade decade being queried
 * @returns {object} decadeData
 * @throws an error if the data cannot be retreieved
 */
exports.getDecadeStatistics = async (decade) => {
  try {
    const fullStatsObject = {};
    const featureArray = [
      'valence',
      'danceability',
      'instrumentalness',
      'energy',
      'speechiness',
      'tempo',
      'acousticness',
    ];

    for (const feature of featureArray) {
      const yearlyAverage = [];

      let year = parseInt(decade, 10); // decade is the first year of decade (ex:1980)
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 10; i++) {
      // gets the average value for each feature for each year in decade
        await getAverageValue(feature, decade, year, year);
        // take out?
        /* yearArrayBottom.push(
        await getTopFeaturesForDecade(feature, 'ASC', 1, decade, year, year),
      );

      yearArrayTop.push(
        await getTopFeaturesForDecade(feature, 'DESC', 1, decade, year, year),
      ); */

        yearlyAverage.push(await getAverageValue(feature, decade, year, year));

        year += 1;
      }
      // formats feature properly (fixes camel case)
      const featureFormatted = utils.jsUcfirst(feature);
      // get overall values for each decade (top songs for each feature)
      fullStatsObject[
        `lowest${featureFormatted}`
      ] = await getTopFeaturesForDecade(
        feature,
        'ASC',
        3,
        decade,
        parseInt(decade, 10),
        parseInt(decade, 10) + 9,
      );

      fullStatsObject[
        `highest${featureFormatted}`
      ] = await getTopFeaturesForDecade(
        feature,
        'DESC',
        3,
        decade,
        parseInt(decade, 10),
        parseInt(decade, 10) + 9,
      );

      /* fullStatsObject[`yearlyHighest${featureFormatted}`] = yearArrayTop;
    fullStatsObject[`yearlyLowest${featureFormatted}`] = yearArrayBottom; */

      fullStatsObject[`yearlyAverage${featureFormatted}`] = yearlyAverage;

      // get average value for each feature in the decade (average valence for each decade)
      fullStatsObject[`average${featureFormatted}`] = await getAverageValue(
        feature,
        decade,
        parseInt(decade, 10),
        parseInt(decade, 10) + 9,
      );
    }
    // get most popular songs & average popilaryof the decade (as of February 2021)
    fullStatsObject.mostPopular = await getTopFeaturesForDecade(
      'popularity',
      'DESC',
      10,
      decade,
      parseInt(decade, 10),
      parseInt(decade, 10) + 9,
    );

    fullStatsObject.averagePopularity = await getAverageValue(
      'popularity',
      decade,
      parseInt(decade, 10),
      parseInt(decade, 10) + 9,
    );

    // get top songs and artists
    fullStatsObject.top10Songs = await getTopSongs(decade);
    fullStatsObject.top10ArtistsByHits = await getTopArtists(decade, 10);

    // get the distrubtion for mode and keys
    const mode = await getFeatureDistribution(decade, 'mode');
    fullStatsObject.modeDistribution = mode.sort((a, b) => a.mode - b.mode);

    // get distrubtion of user songs by time
    const songDistributionByYear = [];

    let year = parseInt(decade, 10);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10; i++) {
      songDistributionByYear.push(await getSongDistributionByYear(decade, year));
      year += 1;
    }
    fullStatsObject.distributionByYear = songDistributionByYear;

    fullStatsObject.mostPopularGenres = await getMostCommonGenres(decade);
    fullStatsObject.topArtists = await getTopArtistsByRank(decade);
    fullStatsObject.description = await getDecadeDiscription(decade);
    return fullStatsObject;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};
/**
 * Gets all the user statistics
 * gets all relevant statistics about user's data
 * @param {string} sessionID - session ID of current user
 * @param {string} decade - decade user is comparing their songs against
 * @return {Object} of user music stats
 * @throws an error if data retrival fails
 */
exports.getUserStatistics = async (sessionID, decade) => {
  try {
    const avgObj = {};
    const fullStatsObject = {};
    const featureArray = [
      'valence',
      'danceability',
      'instrumentalness',
      'energy',
      'speechiness',
      'tempo',
      'acousticness',
    ];

    for (const feature of featureArray) {
      const featureFormatted = utils.jsUcfirst(feature);
      // gets the user top songs for each feature
      fullStatsObject[`highest${featureFormatted}`] = await getUserTopFeatures(
        sessionID,
        feature,
        'DESC',
        3,
      );
      fullStatsObject[`lowest${featureFormatted}`] = await getUserTopFeatures(
        sessionID,
        feature,
        'ASC',
        3,
      );
      // gets user average for each feature
      const val = await getUserAverageFeature(sessionID, feature);
      fullStatsObject[`average${featureFormatted}`] = val;

      avgObj[feature] = val;
    }

    fullStatsObject.top10Songs = await getUserTopFeatures(
      sessionID,
      'rank',
      'ASC',
      10,
    );

    // gets users most popular favourite hits, and average popularity of the music they listen to
    fullStatsObject.mostPopular = await getUserTopFeatures(
      sessionID,
      'popularity',
      'DESC',
      10,
    );

    fullStatsObject.averagePopularity = await getUserAverageFeature(
      sessionID,
      'popularity',
    );
    // get distribution (all these involve count)
    fullStatsObject.songsByDecade = await getUserDistribution(
      sessionID,
      'yearOfRelease',
    );

    fullStatsObject.modeDistribution = await getUserDistribution(
      sessionID,
      'mode',
    );

    let keyDistribution = await getUserDistribution(sessionID, 'key');
    keyDistribution = keyDistribution.sort((a, b) => a.key - b.key);
    fullStatsObject.keyDistribution = keyDistribution;

    fullStatsObject.mostPopularGenres = await userMostPopularGenres(sessionID);
    fullStatsObject.top10ArtistsByHits = await getMostHits(sessionID);

    fullStatsObject.userReccomendations = await getSongReccomendations(
      decade,
      avgObj,
    );

    return fullStatsObject;
  } catch (e) {
    throw new Error({ error: e.message });
  }
};
