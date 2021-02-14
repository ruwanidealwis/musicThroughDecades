const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tempUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // user listens to many songs
      this.belongsToMany(models.Songs, {
        through: models.UserSongs,
        sourceKey: 'sessionId',
        foreignKey: 'sessionId',
        otherKey: 'songId',
      });

      this.belongsToMany(models.Artist, {
        through: models.UserArtists,
        sourceKey: 'sessionId',
        foreignKey: 'sessionId',
        otherKey: 'artistId',
      });
    }
  }
  tempUser.init(
    {
      sessionId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'tempUser',
    },
  );
  return tempUser;
};
