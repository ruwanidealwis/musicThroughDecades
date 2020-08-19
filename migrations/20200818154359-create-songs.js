"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Songs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      //association with decade
      decadeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Decades", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
      },
      name: {
        type: Sequelize.STRING,
      },
      imageUrl: {
        type: Sequelize.STRING,
      },
      yearOfRelease: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
      popularity: {
        type: Sequelize.INTEGER,
      },
      instrumentalness: {
        type: Sequelize.REAL,
      },
      rank: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Songs");
  },
};
