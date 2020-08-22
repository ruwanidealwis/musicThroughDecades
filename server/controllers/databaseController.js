//manipulate DB
/** @global */ const db = require("../../models/index.js");
const { get } = require("../routes/index.js");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

exports.test = async () => {
  let ans = await db.Songs.findAll({
    attributes: ["popularity"],
    where: { name: "Sunflower " },
    include: [{ model: db.tempUser }],
  });
  console.log(ans);
};

/***************************** METHODS FOR CREATING/REMOVING FROM DB */
exports.createTempUser = async (sessionId) => {
  await db.tempUser.create({
    sessionId: sessionId,
  });
};
/********* FUNC */
exports.addSongToDatabase = async (songObjects, decade, index) => {
  let decadeId = await db.Decade.findOne({
    attributes: ["id"],
    where: { name: decade },
    raw: true,
  });
  console.log(songObjects);
  let dateArray = songObjects.release.split("-"); //get the date (we only care about year, not exact date)

  console.log(decadeId);
  console.log(songObjects);
  let song = await db.Songs.create({
    name: songObjects.name,
    yearOfRelease: dateArray[0],
    imageUrl: songObjects.image,
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
    rank: index,
    decadeId: decadeId.id,
    spotifyId: songObjects.spotifyId,
  });
  for (const artist of songObjects.artists) {
    //call helper method
    await addPermanantArtists(artist, decadeId.id, song);
  }
};
//TODO delete every migration, make a tempUser table, add a many to many decade association with artists

exports.addUserSongToDatabase = async (songObjects, index, sessionId) => {
  console.log(songObjects);
  //we first have to check if this song exists...
  let dateArray = songObjects.release.split("-"); //get the date (we only care about year, not exact date)
  let song = await db.Songs.findOne({
    //everything has to be the same..
    attributes: ["id"],
    where: {
      spotifyId: songObjects.spotifyId, //spotifyId for each song is unique!
    },
    include: [{ model: db.Artist }],
  });
  console.log(song);
  if (song == null) {
    //wecreate the song.... but we make it temporary (after we get all the data the song is deleted from the database)
    await createUserEntry(songObjects, dateArray, sessionId, index);
  } else {
    //create a manual association with UserSong and for all the artists aswell
    console.log(sessionId);
    await db.UserSongs.create({
      sessionId: sessionId,
      songId: song.id,
      rank: index,
    });
    for (const artist of song.Artists) {
      //association could have been created with another song
      await db.UserArtists.findOrCreate({
        where: { sessionId: sessionId, artistId: artist.id },
        sessionId: sessionId,
        artistId: artist.id,
      });
    }
  }
};

exports.deleteUserSongsFromDatabase = async (sessionId) => {
  const { Sequelize } = require("sequelize");
  //after we get all the nescessary information...the song will be deleted
  let possibleSongs = await db.Songs.findAll({
    attributes: ["name", "id"],
    where: { temp: true }, //only user songs are temp
    include: [
      { model: db.tempUser },
      { model: db.Artist }, //this will return all the artists associated with this song (that are temporary, becasuse songs could have artists with other perm entries)
    ],
  });
  //console.log(possibleSongs);
  // console.log(possibleSongs);
  console.log(possibleSongs);
  let count = 0;
  for (const song of possibleSongs) {
    //if

    let songId = song.id;

    //this avoids the case where two users are using the app at the same time, and both have the same top song
    if (song.tempUsers.length == 1) {
      if (song.tempUsers[0].sessionId == sessionId) {
        //destroy it....
        count++;
        //song can be deleted, but can artists be?

        //because of cascade delete it will delete this from userSongs database
        for (const artist of song.Artists) {
          // we know they are temporary, but that does not mean they are not associated with other users!
          console.log(artist);

          //if there is only one user that is associated with it and that user is current user (then delete it from DB)
          //console.log("Other Users.....");
          // console.log(otherUsers);
          await deleteUserArtistsFromDatabase(artist, sessionId);
        }
        await db.Songs.destroy({
          where: { id: songId },
        });
      }

      //now should be removed from all associations
    }
  }
  await db.tempUser.destroy({ where: { sessionId: sessionId } }); //delete it from userDB
  console.log(count);
};

//get all temps, get associations with just 1 currently (and delete it from the database if the id is equal to user)

//HELPER METHODS
let createUserEntry = async (songObjects, dateArray, sessionId, index) => {
  let userSong = await db.Songs.create({
    name: songObjects.name,
    yearOfRelease: dateArray[0],
    imageUrl: songObjects.imageUrl,
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
    temp: true, //song is temporary and no decade Id.... (we need to delete it)
  });
  for (const artist of songObjects.artists) {
    let artist_id = await db.Artist.findOne({
      attributes: ["id"],
      where: {
        name: artist.name,
        imageURL: artist.imageURL,
      }, //TODO CHANGE THIS}
      raw: true,
    });
    console.log(artist_id);
    let createArtistId;
    if (artist_id == null) {
      //create new artist and then add it...
      let newArtistId = await db.Artist.create({
        //where: { name: artist.name, imageURL: artist.imageURL },
        name: artist.name,
        imageURL: artist.imageURL,
        genres: artist.genres, //TODO CHANGE THIS
        temp: true,
      });
      //create an association with decade
      await userSong.addArtist(newArtistId);
      createArtistId = newArtistId.id;
    } else {
      //already created we just add an extra association
      await db.SongArtists.create({
        artistId: artist_id.id,
        songId: userSong.id,
      });
      createArtistId = artist_id.id;
    }
    //null if the song didn't exist before
    await db.UserArtists.findOrCreate({
      where: {
        sessionId: sessionId,
        artistId: createArtistId,
      },
      sessionId: sessionId,
      artistId: createArtistId,
    });
  }
  await db.UserSongs.create({
    sessionId: sessionId,
    songId: userSong.id,
    rank: index,
  }); //add this to user and session ID to the associated table
};

let addPermanantArtists = async (artist, decadeId, song) => {
  let artist_id = await db.Artist.findOne({
    attributes: ["id"],
    include: [{ model: db.Decade }],
    where: {
      name: artist.name,
      imageURL: artist.imageURL,
    }, //TODO CHANGE THIS}
    raw: true,
  });
  if (artist_id == null) {
    //create new artist and then add it...
    let artistId = await db.Artist.create({
      //where: { name: artist.name, imageURL: artist.imageURL },
      name: artist.name,
      imageURL: artist.imageURL,
      genres: artist.genres, //TODO CHANGE THIS
    });
    //create an association with decade
    await song.addArtist(artistId);
    await db.DecadeArtists.create({
      artistId: artistId.id,
      decadeId: decadeId,
    });
    // console.log(artist_id);
  } else {
    //already created we just add an extra association
    await db.SongArtists.create({
      artistId: artist_id.id,
      songId: song.id,
    });

    //determine if the artist is associated with the current decade being searched
    let currentDecades = await db.Artist.findOne({
      attributes: ["id"],
      where: { name: artist.name, imageURL: artist.imageURL },
      include: [{ model: db.Decade, where: { id: decadeId } }],
      raw: true,
    });

    if (currentDecades == null) {
      //add new decade association (this happens when an artist from another decade appears in this dedcade)
      await db.DecadeArtists.create({
        artistId: artist_id.id,
        decadeId: decadeId,
      });
    }
  }
};

let deleteUserArtistsFromDatabase = async (artist, sessionId) => {
  let otherUsers = await db.Artist.findByPk(artist.id, {
    include: [{ model: db.tempUser }, { model: db.Songs }],
  });
  //if there is only one user that is associated with it and that user is current user (then delete it from DB)
  console.log("Other Users.....");
  console.log(otherUsers);

  //if its null it means that the artist was also in another song and was already deleted
  //has to be false otherwise the artist is one of the artists of the decade....
  if (otherUsers != null && otherUsers.temp == true) {
    if (otherUsers.tempUsers.length == 1) {
      if (otherUsers.tempUsers[0].sessionId == sessionId) {
        db.Artist.destroy({
          where: { id: artist.id },
        });
      }
    }
  }
};

let getSongDistributionByYear = (decade, year) => {
  return db.Decade.findOne({
    where: { name: decade },
    include: [{ model: db.Songs, where: { yearOfRelease: year } }],
  }).then((data) => {
    console.log(data);
    console.log(data.Songs);
    return data.Songs.length;
  });
};

/********************************* METHODS FOR QUERYING DATABASE */
exports.getAmount = async (decade) => {
  let decadeInfo = await db.Decade.findOne({
    where: { name: decade },
    include: [{ model: db.Songs }],
  }); //only have one, name is unique

  console.log(decadeInfo.Songs.length);
  return decadeInfo.Songs.length;
};

let getDecadeId = async (decade) => {
  return db.Decade.findOne({
    attributes: ["id"],
    raw: true,
    where: { name: decade },
  }).then((data) => {
    return data.id;
  });
};

getAverageValue = async (feature, decade, start, end) => {
  const { Sequelize } = require("sequelize");

  return getDecadeId(decade)
    .then((id) => {
      return db.Songs.findOne({
        attributes: [[Sequelize.fn("AVG", Sequelize.col(feature)), "average"]],
        where: {
          decadeId: id,
          yearOfRelease: { [Op.between]: [start, end] },
        },
        raw: true,
      });
    })
    .then((data) => {
      console.log(data);
      return data.average;
    });
  //console.log(decadeInfo.Songs);
};
getTopFeaturesForDecade = async (
  feature,
  ordering,
  limit,
  decade,
  start,
  end
) => {
  let objArray = [];
  const { Op } = require("sequelize");
  let decadeInfo = await db.Decade.findOne({
    where: { name: decade },
    include: [
      {
        attributes: ["name", feature, "yearOfRelease", "rank", "id"],
        required: false,
        model: db.Songs,
        order: [[feature, ordering]],
        limit: limit,
        where: { yearOfRelease: { [Op.between]: [start, end] } },
      },
    ],
  }); //only have one, name is unique

  for (const songs of decadeInfo.Songs) {
    // console.log(songs);
    //cant do it in original query, breaks it
    let songArtists = await db.Songs.findByPk(songs.id, {
      include: [{ model: db.Artist }],
    });
    let artistsArray = [];
    songArtists.Artists.forEach((artist) =>
      artistsArray.push({ name: artist.name, genres: artist.genres })
    );

    let obj = {
      name: songs.name,
      year: songs.yearOfRelease,
      rank: songs.rank,
      [feature]: songs[feature],
      artists: artistsArray,
    };
    objArray.push(obj);
  }
  return objArray;
};

//get the top 10 songs of the decade....
let getTopSongs = (decade) => {
  let TopArray = [];
  return getDecadeId(decade).then((id) => {
    return db.Songs.findAll({
      attributes: ["name", "rank"],
      where: { decadeId: id },
      include: { model: db.Artist },
      limit: 10,
    })
      .then((songs) => {
        for (const song of songs) {
          console.log(song);
          let artists = [];

          for (const artist of song.Artists) {
            artists.push(artist.name);
          }
          TopArray.push({
            name: song.name,
            rank: song.rank,
            artists: artists,
            image: song.imageUrl,
          });
        }
      })
      .then(() => {
        return TopArray;
      });
  });
};

let getFeatureDistribution = async (decade, feature) => {
  return getDecadeId(decade).then((id) => {
    return db.Songs.findAll({
      where: { decadeId: id, [feature]: { [Op.or]: { [Op.ne]: -1 } } },
      attributes: [
        feature,
        [Sequelize.fn("COUNT", Sequelize.col(feature)), "count"],
      ],
      group: feature, //group by feature
      raw: true, //get raw data
    });
  });
};

let getMostCommonGenres = async (decade) => {
  //couldnt get sequelize query to work //TODO check later
  return getDecadeId(decade).then((id) => {
    return db.sequelize
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
         "decadeId" = ${id}
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
        }
      )
      .then((data) => {
        return data;
      });
  });
};

let getTopArtists = async (decade, limit) => {
  const { Sequelize } = require("sequelize");

  //couldnt get sequelize query to work //TODO check later
  return getDecadeId(decade)
    .then((id) => {
      return db.sequelize.query(
        `SELECT
   "Decade"."id",
   "Artists"."name" AS "Artists.name",
   "Artists"."imageURL" AS "Artists.imageURL",
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
            AND "Artists -> Songs"."decadeId" = ${id}
      )
      ON "Decade"."id" = "Artists -> DecadeArtists"."decadeId" 
WHERE
   "Decade"."id" = ${id}
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
        }
      );
    })
    .then((data) => {
      //console.log(data);
      let topArtists = [];
      for (const artist of data) {
        console.log(artist);
        topArtists.push({
          name: artist["Artists.name"],
          hits: artist["Artists.Songs.count"],
          image: artist["Artists.imageURL"],
        });
      }
      return topArtists;
    });
};

exports.getDecadeStatistics = async (decade) => {
  let fullStatsObject = {};
  let featureArray = [
    "valence",
    "danceability",
    "instrumentalness",
    "energy",
    "speechiness",
    "tempo",
    "acousticness",
  ];

  for (const feature of featureArray) {
    let yearArrayTop = [];
    let yearlyAverage = [];
    let yearArrayBottom = [];
    let songDistributionByYear = [];

    let year = parseInt(decade); //decade is the first year of decade (ex:1980)
    for (let i = 0; i < 10; i++) {
      //will return for each year in the decade, the top/lowest song of each feature (ex: valence), and the average value for that feature
      await getAverageValue(feature, decade, year, year);
      yearArrayBottom.push(
        await getTopFeaturesForDecade(feature, "ASC", 1, decade, year, year)
      );

      yearArrayTop.push(
        await getTopFeaturesForDecade(feature, "DESC", 1, decade, year, year)
      );

      yearlyAverage.push(await getAverageValue(feature, decade, year, year));

      year++;
    }
    fullStatsObject[`lowest_${feature}`] = await getTopFeaturesForDecade(
      feature,
      "ASC",
      3,
      decade,
      parseInt(decade),
      parseInt(decade) + 9
    );
    fullStatsObject[`highest_${feature}`] = await getTopFeaturesForDecade(
      feature,
      "DESC",
      3,
      decade,
      parseInt(decade),
      parseInt(decade) + 9
    );
    fullStatsObject[`yearly_highest_${feature}`] = yearArrayTop;
    fullStatsObject[`yearly_lowest_${feature}`] = yearArrayBottom;
    fullStatsObject[`yearly_average_${feature}`] = yearlyAverage;

    fullStatsObject[`average_${feature}`] = await getAverageValue(
      feature,
      decade,
      parseInt(decade),
      parseInt(decade) + 9
    );
  }
  //get most popular songs of the decade (as of August 2020)
  fullStatsObject[`most_popular`] = await getTopFeaturesForDecade(
    "popularity",
    "DESC",
    10,
    decade,
    parseInt(decade),
    parseInt(decade) + 9
  );

  //get top songs and artists
  fullStatsObject[`top_10_songs`] = await getTopSongs(decade);
  fullStatsObject[`top_10_artists_by_hits`] = await getTopArtists(decade, 10);
  fullStatsObject[`mode_distribution`] = await getFeatureDistribution(
    decade,
    "mode"
  );
  fullStatsObject[`key_distribution`] = await getFeatureDistribution(
    decade,
    "key"
  );

  //console.log(modeD);
  //get Key distributions
  let songDistributionByYear = [];
  let year = parseInt(decade);
  for (let i = 0; i < 10; i++) {
    songDistributionByYear.push(await getSongDistributionByYear(decade, year));
    year++;
  }

  fullStatsObject[`distribution_by_year`] = songDistributionByYear;
  fullStatsObject[`most_popular_genres`] = await getMostCommonGenres(decade);

  console.log(fullStatsObject);
  return fullStatsObject;
  //console.log(fullStatsObject);

  //get overll adecade stats
};

let getUserTopFeatures = async (sessionId, feature, order, limit) => {
  let orderArray = [Sequelize.literal(`"Songs"."${feature}" ${order}`)];
  let attributes = `Songs.${feature}`;
  if (feature == "rank")
    orderArray = [
      Sequelize.literal(`"Songs->UserSongs"."${feature}" ${order}`),
    ];
  attributes = `Songs->UserSongs"."${feature}`;
  return db.tempUser
    .findAll({
      attributes: ["sessionId", attributes],
      where: { sessionId: sessionId },
      include: [
        {
          model: db.Songs,

          raw: true,
          include: [{ model: db.Artist }],
        },
      ],

      order: [orderArray],

      //order: [[db.UserSongs, "createdAt", "DESC"]],
    })
    .then((data) => {
      // console.log(data);
      let topSongs = [];
      //console.log(data);
      let i = 1;
      //console.log(data);
      for (const song of data[0].Songs) {
        console.log(song);
        let artists = [];
        for (const artist of song.Artists) {
          artists.push(artist.name);
        }
        topSongs.push({
          name: song.name,
          artists: artists,
          [feature]: song[feature] || i,
          image: song.imageUrl,
        });
        if (i == limit) break;
        i++;
      }
      return topSongs;
    });
};

let getUserAverageFeature = async (sessionId, feature) => {
  return db.tempUser
    .findAll({
      attributes: [
        "sessionId",
        [Sequelize.fn("AVG", Sequelize.col(`Songs.${feature}`)), "average"],
      ],

      where: { sessionId: sessionId },
      include: {
        model: db.Songs,
        as: "Songs",
        raw: true,
        attributes: [],
        through: { attributes: [] },
      },
      group: ["tempUser.id"],
      raw: true,

      //order: [[db.UserSongs, "createdAt", "DESC"]],
    })
    .then((data) => {
      // console.log(data);
      return data[0].average;
    });
};

let getUserDistribution = async (sessionId, feature) => {
  return db.tempUser
    .findAll({
      attributes: [
        `Songs.${feature}`,
        [Sequelize.fn("Count", Sequelize.col(`Songs.${feature}`)), "count"],
      ],

      where: { sessionId: sessionId },
      include: {
        model: db.Songs,
        as: "Songs",
        raw: true,
        attributes: [],
        through: { attributes: [] },
      },
      group: [`Songs.${feature}`],
      raw: true,

      //order: [[db.UserSongs, "createdAt", "DESC"]],
    })
    .then((data) => {
      let decadeDistribution = data;
      console.log(data);
      for (const key of data) {
        if (feature == "yearOfRelease") {
          decadeDistribution = {};
          for (const key of data) {
            decadeDistribution[key.yearOfRelease - (key.yearOfRelease % 10)] =
              decadeDistribution[key.yearOfRelease - (key.yearOfRelease % 10)] +
                key.count || key.count;
          }
        }
      }
      return decadeDistribution;
    });
};

let getSongReccomendations = (decadeId, infoObj) => {
  return getDecadeId(decadeId).then((id) => {
    return db.Songs.findAll({
      attributes: ["name", "imageUrl", "spotifyId"],
      include: [{ model: db.Artist }],
      where: {
        decadeId: id,

        [Op.and]: {
          valence: {
            [Op.between]: [infoObj.valence - 0.2, infoObj.valence + 0.2],
          },
          energy: {
            [Op.between]: [infoObj.energy - 0.2, infoObj.energy + 0.2],
          },
          danceability: {
            [Op.between]: [
              infoObj.danceability - 0.2,
              infoObj.danceability + 0.2,
            ],
          },
          tempo: { [Op.between]: [infoObj.tempo - 30, infoObj.tempo + 30] },
        },
      },
    }).then((data) => {
      let reccomendationsArray = [];
      console.log(data);
      for (const song of data) {
        let artists = [];
        for (const artist of song.Artists) {
          artists.push(artist.name);
        }
        reccomendationsArray.push({
          name: song.name,
          artists: artists,
          image: song.imageUrl,
          spotifyId: song.spotifyId,
        });
      }
      return reccomendationsArray;
    });
  });
};
let userMostPopularGenres = (sessionId) => {
  return db.sequelize
    .query(
      `
select
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
         "sessionId" ='${sessionId}'
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
      }
    )
    .then((data) => {
      return data;
    });
};

let getMostHits = (sessionId) => {
  db.tempUser
    .findAll({
      where: { sessionId: sessionId },
      include: [
        {
          model: db.Artist,
          as: "Artists",
          attributes: ["name", "imageURL"],
          include: [
            {
              model: db.Songs,
              attributes: ["name"],
              include: [
                {
                  model: db.tempUser,
                  where: { sessionId: sessionId },
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
      ],
    })
    .then((data) => {
      let artistArray = [];
      //console.log(data);
      for (const artists of data[0].Artists) {
        for (const songs of artists.Songs) {
          //console.log(songs.name);
        }
        console.log();
        artistArray.push({
          name: artists.name,
          hits: artists.Songs.length,
          image: artists.imageURL,
        });
      }
      //have to manually sort //TODO find postgres workaround
      artistArray.sort((a, b) => {
        return b.hits - a.hits;
      });
      return artistArray;
    });
};

exports.getUserStatistics = async (sessionId) => {
  let topSongs = await getUserTopFeatures(sessionId, "rank", "ASC", 10);
  let avgObj = {};
  let fullStatsObject = {};
  let featureArray = [
    "valence",
    "danceability",
    "instrumentalness",
    "energy",
    "speechiness",
    "tempo",
    "acousticness",
  ];

  for (const feature of featureArray) {
    fullStatsObject[`highest_${feature}`] = await getUserTopFeatures(
      sessionId,
      feature,
      "DESC",
      3
    );
    fullStatsObject[`lowest_${feature}`] = await getUserTopFeatures(
      sessionId,
      feature,
      "ASC",
      3
    );
    let val = await getUserAverageFeature(sessionId, feature);
    fullStatsObject[`average_${feature}`] = val;

    avgObj[feature] = val;
  }

  //get top features
  fullStatsObject[`top_10_songs`] = await getUserTopFeatures(
    sessionId,
    "rank",
    "DESC",
    10
  );

  //all require rank
  fullStatsObject[`most_popular`] = await getUserTopFeatures(
    sessionId,
    "popularity",
    "DESC",
    3
  );

  //get distribution (all these involve count)

  fullStatsObject[`songs_by_decade`] = await getUserDistribution(
    sessionId,
    "yearOfRelease"
  );

  fullStatsObject[`mode_distribution`] = await getUserDistribution(
    sessionId,
    "mode"
  );

  fullStatsObject[`key_distribution`] = await getUserDistribution(
    sessionId,
    "key"
  );

  fullStatsObject[`favourte_genres`] = await userMostPopularGenres(sessionId);
  // console.log(fullStatsObject);
  let ans = await getMostHits(sessionId);
  fullStatsObject[`top_10_artists_by_hits`] = await userMostPopularGenres(
    sessionId
  );

  let reccomendations = await getSongReccomendations("1970", avgObj);

  console.log(reccomendations);
  //TODO get user top tracks--done
  //TODO get user top artists (get it from the API)
  //TODO get user song popularity---dine
  //TODO get user average feature value---donw
  //TODO get user top songs for each feature--done
  //TODO get user distribution---done
  //TODO get user most popular genres--done
  //TODO get song reccomendations
};

//to get top artists
//topDecadeArtist
//1 decade has many top Artists
//artists can have many artists
//exactly like DecadeArtists --> but has rank
//get top artists, order by rank....
