"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Artist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      console.log(models);

      this.belongsToMany(models.Songs, {
        through: models.SongArtists,
        foreignKey: "artistId",
      });

      this.belongsToMany(models.Decade, {
        through: models.DecadeArtists,
        foreignKey: "artistId",
      });
    }
  }
  Artist.init(
    {
      name: DataTypes.STRING,
      genres: DataTypes.ARRAY(DataTypes.STRING),
      imageURL: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Artist",
    }
  );
  return Artist;
};
