"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Decades", [
      {
        name: "1950",
        description:
          "Rock and roll dominated the decade and the Electric Guitar was introduced and heavily popularized, along with Rhythm and Blues and Gospel music. ",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1960",
        description:
          "The 60s were characterized by Rock along with the rise of Soul and Jazz. THere were many British acts that achieved mainstream popularity in the 60s, konown as the British Invasion.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1970",
        description:
          "Disco and sub genres of Rock dominated the decade,including Punk Rock. Jazz still remained popular throughout the 70s, though it did decline in popularity. ",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1980",
        description:
          "The 1980's where characterized by the emerging popularity of dance music and the new wave. Rock was still prominent where as disco began to fall out of fashion, and saw the rise of electronic music.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1990",
        description:
          "Hip-Hop rose in popularity and teen pop and dance pop continued to make its mark. Alternative rock and grunge were also very popular and electronic music continued to gain momentum. ",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "2000",
        description:
          "Teen pop continued to dominate this decade along with contemporary R&B, alternative Rock and continued the growing love for Hip Hop that began in the 90s. Electronic music continued to dominate.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "2010",
        description:
          "Pop music and Hip-Hop continued to dominate has it had the previous decades, along with the emergence of Teep Pop Stars and Boy Bands ",
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
