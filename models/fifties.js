"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class fifties extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  fifties.init(
    {
      song: DataTypes.STRING,
      artists: DataTypes.ARRAY(DataTypes.STRING),
      imageUrl: DataTypes.STRING,
      yearOfRelease: DataTypes.INTEGER,
      genre: DataTypes.STRING,
      valence: DataTypes.REAL,
      danceability: DataTypes.REAL,
      energy: DataTypes.REAL,
      mode: DataTypes.INTEGER,
      key: DataTypes.INTEGER,
      speechiness: DataTypes.REAL,
      tempo: DataTypes.REAL,
      acousticness: DataTypes.REAL,
      rank: DataTypes.INTEGER,
      popularity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "fifties",
    }
  );
  return fifties;
};
