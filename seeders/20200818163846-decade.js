"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Decades", [
      {
        name: "1950",
        description:
          "Rock and roll dominated popular music in the mid 1950s and late 1950s, and quickly spread to much of the rest of the world. Its immediate origins lay in a mixing together of various black musical genres of the time, including rhythm and blues and gospel music; with country and western and Pop.The 1950s saw the growth in popularity of the big boom electric guitar (developed and popularized by Les Paul).",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1960",
        description:
          "In North America and Europe the decade was particularly revolutionary in terms of popular music, as it saw the evolution of rock. At the beginning of the 1960s, pop and rock and roll trends of the 1950s continued; nevertheless, the rock and roll of the decade before started to merge into a more international, eclectic variant. In",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1970",
        description:
          "Other subgenres of rock, particularly glam rock, hard rock, progressive, art rock and heavy metal achieved various amounts of success. Other genres such as reggae were innovative throughout the decade and grew a significant following.[3] Hip hop emerged during this decade but was slow to start and did not become significant until the late 1980s. ",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1980",
        description:
          "The 1980s saw the emergence of dance music and new wave. As disco fell out of fashion in the decade's early years, genres such as post-disco, Italo disco, Euro disco and dance-pop became more popular. Rock music continued to enjoy a wide audience.[2] Soft rock,[3] glam metal, thrash metal, shred guitar characterized by heavy distortion, pinch harmonics and whammy bar abuse became very popular.The 1980s are commonly remembered for an increase in the use of digital recording, associated with the usage of synthesizers, with synth-pop music and other electronic genres featuring non-traditional instruments increasing in popularity. Also during this decade, several major electronic genres were developed, including electro, techno, house, freestyle and Eurodance, rising in prominence during the 1990s and beyond.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "1990",
        description:
          "1990s saw the continuation of teen pop and dance-pop trends which had emerged in the 1970s and 1980s. Furthermore, hip hop grew and continued to be highly successful in the decade, with the continuation of the genre's golden age. Aside from rap, reggae, contemporary R&B and urban music in general remained extremely popular throughout the decade; urban music in the late-1980s and 1990s often blended with styles such as soul, funk and jazz, resulting in fusion genres such as new jack swing, neo-soul, hip hop soul and g-funk which were popular.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "2000",
        description:
          "n American culture, various styles of the late 20th century remained popular, such as in rock, pop, metal, hip hop, R&B, EDM, country and indie. As the technology of computers and internet sharing developed, a variety of those genres started to fuse in order to see new styles emerging. Contemporary R&B was one of the most popular genres of the decade (especially in the early and mid 2000s), with artists like Usher, Alicia Keys, Beyoncé, and Rihanna. Hip hop music achieved mainstream status after the 1990s and the deaths of many prominent artists such as 2Pac and The Notorious B.I.G.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "2010",
        description:
          "Throughout the 2010s, different movements in music and the music industry has been formed because of the rise of social media such as YouTube, TikTok, and Soundcloud. Some new, sometimes unique, genres of music have been introduced such as lo-fi hip-hop, vaporwave, and bedroom pop. Pop music had remained significantly popular due to dance-pop, electropop and synth-pop in this decade. Artists like Taylor Swift, Ariana Grande, Selena Gomez, One Direction, Adele, Lady Gaga, Katy Perry were very popular and chart-topping pop songs this decade.",
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
