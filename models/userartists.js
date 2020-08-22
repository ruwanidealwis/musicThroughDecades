"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserArtists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Artist, {
        foreignKey: "artistId",

        as: "Artist",
      });

      this.belongsTo(models.tempUser, {
        foreignKey: "sessionId",
        targetKey: "sessionId",
        constraints: false,
      });
    }
  }
  UserArtists.init(
    {
      sessionId: DataTypes.STRING,
      artistId: DataTypes.INTEGER,
      rankId: DataTypes.Integer,
    },
    {
      sequelize,
      modelName: "UserArtists",
    }
  );
  return UserArtists;
};
