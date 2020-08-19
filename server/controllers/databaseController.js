//manipulate DB
/** @global */ const db = require("../../models/index.js");

exports.test = async () => {
  let ans = await db.Artist.findAll({
    where: { name: "Michael Jackson" },
    include: [{ model: db.Songs }, { model: db.Decade }],
  });
  console.log(ans);
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
  });
  for (const artist of songObjects.artists) {
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
        decadeId: decadeId.id,
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
        include: [{ model: db.Decade, where: { id: decadeId.id } }],
        raw: true,
      });

      if (currentDecades == null) {
        //add new decade association (this happens when an artist from another decade appears in this dedcade)
        await db.DecadeArtists.create({
          artistId: artist_id.id,
          decadeId: decadeId.id,
        });
      }
    }
  }
};
//TODO delete every migration, make a tempUser table, add a many to many decade association with artists

exports.addUserSongToDatabase(songObjects, i);
{
  //we first have to check if this song exists...

  let song = await db.Songs.findOne({
    //everything has to be the same..
    attributes: ["id"],
    where: {
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
    },
    raw: true,
  });

  if (song == null) {
    //wecreate the song.... but we make it temporary (after we get all the data the song is deleted from the database)
    let userSong = await db.Songs.create({
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
      temp: true, //song is temporary
    });
    userSong.addtempUser();
  }
}
