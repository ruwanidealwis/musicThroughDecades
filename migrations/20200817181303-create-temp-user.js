"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tempUsers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      song: {
        type: Sequelize.STRING,
      },
      artists: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      imageUrl: {
        type: Sequelize.STRING,
      },
      yearOfRelease: {
        type: Sequelize.INTEGER,
      },
      genre: {
        type: Sequelize.STRING,
      },
      valence: {
        type: Sequelize.REAL,
      },
      danceability: {
        type: Sequelize.REAL,
      },
      energy: {
        type: Sequelize.REAL,
      },
      mode: {
        type: Sequelize.STRING,
      },
      key: {
        type: Sequelize.INTEGER,
      },
      speechiness: {
        type: Sequelize.REAL,
      },
      tempo: {
        type: Sequelize.REAL,
      },
      acousticness: {
        type: Sequelize.REAL,
      },
      rank: {
        type: Sequelize.INTEGER,
      },
      popularity: {
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
    await queryInterface.dropTable("tempUsers");
  },
};
