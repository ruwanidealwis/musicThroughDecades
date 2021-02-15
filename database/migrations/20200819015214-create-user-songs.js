module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserSongs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: {
        type: Sequelize.STRING,
        references: {
          model: 'tempUsers',
          key: 'sessionId',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      songId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Songs',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      rank: {
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
    await queryInterface.dropTable('UserSongs');
  },
};
