"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class twothousands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  twothousands.init(
    {
      song: DataTypes.STRING,
      artists: DataTypes.ARRAY(DataTypes.STRING),
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
      rank: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "twothousands",
    }
  );
  return twothousands;
};
