"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserArtists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: {
        type: Sequelize.STRING,
        references: {
          model: "tempUsers",
          key: "sessionId",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      },
      artistId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Artists",
          key: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
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
    await queryInterface.dropTable("UserArtists");
  },
};
