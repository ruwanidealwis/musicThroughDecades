"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Songs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.decade = this.belongsTo(models.Decade, { foreignKey: "decadeId" }); //each song belongs to 1 decade

      this.belongsToMany(models.Artist, {
        through: models.SongArtists,
        foreignKey: "songId",
      });

      //songs can have many users who listen to it
      this.belongsToMany(models.tempUser, {
        through: models.UserSongs,
        foreignKey: "songId",
      });
    }
  }
  Songs.init(
    {
      name: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      yearOfRelease: DataTypes.INTEGER,
      valence: DataTypes.REAL,
      danceability: DataTypes.REAL,
      energy: DataTypes.REAL,
      mode: DataTypes.INTEGER,
      key: DataTypes.INTEGER,
      speechiness: DataTypes.REAL,
      tempo: DataTypes.REAL,
      acousticness: DataTypes.REAL,
      popularity: DataTypes.INTEGER,
      instrumentalness: DataTypes.REAL,
      rank: DataTypes.INTEGER,
      decadeId: DataTypes.INTEGER,
      temp: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Songs",
    }
  );
  return Songs;
};
