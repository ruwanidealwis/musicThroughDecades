const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SongArtists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Songs, {
        foreignKey: 'songId',
        targetKey: 'id',
        as: 'Songs',
      });

      this.belongsTo(models.Artist, {
        foreignKey: 'artistId',
        targetKey: 'id',
        as: 'Artist',
      });
    }
  }
  SongArtists.init(
    {
      songId: DataTypes.INTEGER,
      artistId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'SongArtists',
    },
  );
  return SongArtists;
};
