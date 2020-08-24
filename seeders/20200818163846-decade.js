"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Decades", [
      {
        name: "1950",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1960",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1970",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1980",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1990",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "2000",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "2010",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  /**
   * Add seed commands here.
   *
   * Example:
   * await queryInterface.bulkInsert('People', [{
   *   name: 'John Doe',
   *   isBetaMember: false
   * }], {});
   */

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Decades", null, {});
  },
};
