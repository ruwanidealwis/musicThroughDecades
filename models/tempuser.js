"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tempUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //user listens to many songs
      this.belongsToMany(models.Songs, {
        through: models.UserSongs,
        foreignKey: "sessionId",
      });
    }
  }
  tempUser.init(
    {
      sessionId: DataTypes.STRING,
      songId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tempUser",
    }
  );
  return tempUser;
};
