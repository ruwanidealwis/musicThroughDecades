"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Decade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //each decade has many top songs, but song has only one decade (song is only ever released "once")
      this.hasMany(models.Songs, { foreignKey: "decadeId" });

      //each decade has many artists, and each aritst can belong to many decades (ex: Michael Jackson, Elton John both appear as top artists in various decades)
      this.belongsToMany(models.Artist, {
        through: models.DecadeArtists,
        foreignKey: "decadeId",
      });
    }
  }
  Decade.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Decade",
    }
  );
  return Decade;
};
