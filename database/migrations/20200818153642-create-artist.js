module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Artists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      genres: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      imageURL: {
        type: Sequelize.STRING,
      },
      temp: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('Artists');
  },
};
