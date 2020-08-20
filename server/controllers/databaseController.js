//manipulate DB
/** @global */ const db = require("../../models/index.js");

exports.test = async () => {
  let ans = await db.Songs.findAll({
    attributes: ["popularity"],
    where: { name: "Sunflower " },
    include: [{ model: db.tempUser }],
  });
  console.log(ans);
};

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
