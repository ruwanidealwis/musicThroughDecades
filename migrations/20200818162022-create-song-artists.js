"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SongArtists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      songId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Songs",
          key: "id",
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
    await queryInterface.dropTable("SongArtists");
  },
};
