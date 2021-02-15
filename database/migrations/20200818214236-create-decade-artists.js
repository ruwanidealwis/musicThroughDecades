module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DecadeArtists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      decadeId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Decades', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
      },
      // should create a temp user table with id, sessionId, have a tempbool that is set to false by default, delete from table where this is temp, and sessionId
      // will have many to many with sessionId..., delete all sessionID from userSongs table
      // delete from database if:
      // it is temp, include users, if user.sessionId === currentSessionId;
      // delete the row off association table, delete the tow ferom song table , remove all sessionId from user DB
      artistId: {
        type: Sequelize.INTEGER,

        references: {
          model: 'Artists',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      rank: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DecadeArtists');
  },
};
