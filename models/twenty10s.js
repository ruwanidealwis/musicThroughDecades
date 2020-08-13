"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class twenty10s extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  twenty10s.init(
    {
      song: DataTypes.STRING,
      artists: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      yearOfRelease: DataTypes.INTEGER,
      genre: DataTypes.STRING,
      valence: DataTypes.REAL,
      danceability: DataTypes.REAL,
      energy: DataTypes.REAL,
      mode: DataTypes.STRING,
      key: DataTypes.INTEGER,
      speechiness: DataTypes.REAL,
      tempo: DataTypes.REAL,
      acousticness: DataTypes.REAL,
    },
    {
      sequelize,
      modelName: "twenty10s",
    }
  );
  return twenty10s;
};