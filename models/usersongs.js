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
      });

      this.belongsTo(models.tempUser, {
        foreignKey: "sessionId",
        targetKey: "sessionId",
      });
    }
  }
  UserSongs.init(
    {
      sessionId: DataTypes.STRING,
      songId: DataTypes.INTEGER,
      rank: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserSongs",
    }
  );
  return UserSongs;
};
