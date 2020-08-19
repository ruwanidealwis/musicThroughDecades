"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DecadeArtists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Decade, {
        foreignKey: "decadeId",
        targetKey: "id",
        as: "Decade",
      });

      this.belongsTo(models.Artist, {
        foreignKey: "artistId",
        targetKey: "id",
        as: "Artist",
      });
    }
  }
  DecadeArtists.init(
    {
      decadeId: DataTypes.INTEGER,
      artistId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "DecadeArtists",
    }
  );
  return DecadeArtists;
};
