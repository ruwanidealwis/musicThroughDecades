"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserSongs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Songs, {
        foreignKey: "songId",
        targetKey: "id",
        as: "Songs",
      });

      this.belongsTo(models.tempUser, {
        foreignKey: "sessionId",
        targetKey: "sessionId",
        as: "User",
      });
    }
  }
  UserSongs.init(
    {
      sessionId: DataTypes.STRING,
      songId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserSongs",
    }
  );
  return UserSongs;
};
