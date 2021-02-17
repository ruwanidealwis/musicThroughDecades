/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

const assert = require('assert');
const rewire = require('rewire');
const sinon = require('sinon');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyController = rewire('../controllers/spotifyController');
const databaseController = require('../controllers/databaseController');
// test spotify controller, stub dependency

process.env.NODE_ENV = 'test';

// eslint-disable-next-line no-underscore-dangle
const getArtistInfo = spotifyController.__get__('getArtistInfo');
const getAudioInfo = spotifyController.__get__('getAudioInfo');
const getBasicSongInfo = spotifyController.__get__('getBasicSongInfo');
const getSongInformation = spotifyController.__get__('getSongInformation');
const getUserSongAudioInformation = spotifyController.__get__('getUserSongAudioInformation');
const getUserTopTracks = spotifyController.__get__('getUserTopTracks');
const getUserTopArtists = spotifyController.__get__('getUserTopArtists');
const getUserID = spotifyController.__get__('getUserID');

const controllerStub = {
  getArtistInfo,
  getAudioInfo,
  getBasicSongInfo,
  getSongInformation,
};

describe('Spotify Controller (Spotify API mocked)', () => {
  describe('getArtistInfo', () => {
    it('given a list of ids, it should make a call to an external API', async () => {
      const IDs = ['1231435', '234234', '23432423', '234234']; // random set of ID's

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getArtists.withArgs(IDs).returns({
        body: {
          artists: [
            {
              name: 'john doe', images: [{ url: '/url' }], genres: 'pop', year: '1000',
            },
            {
              name: 'jane doe', images: [{ url: '/url' }], genres: 'rap', year: '1000',
            }],
        },
      });
      const expectedData = [{ name: 'john doe', genres: 'pop', image: '/url' }, { name: 'jane doe', genres: 'rap', image: '/url' }];

      const actualData = await getArtistInfo(IDs);
      assert.strictEqual(stubContainer.getArtists.withArgs(IDs).callCount, 1);// Use withArgs in
      assert.deepStrictEqual(expectedData, actualData);
    });
  });

  describe('getArtistInfo', () => {
    it('given a list of ids, it should make a call to an external API, but API has an error', async () => {
      const IDs = ['1231435', '234234', '23432423', '234234']; // random set of ID's

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getArtists.withArgs(IDs).throwsException('WebAPIError');
      assert.rejects(async () => { await getArtistInfo(IDs); }, Error);
      // assert.throws(await getArtistInfo(IDs), Error, 'WebAPIError');
      assert.strictEqual(stubContainer.getArtists.withArgs(IDs).callCount, 1);// Use withArgs in
      // assert.deepStrictEqual(expectedData, actualData);
    });
  });

  describe('getAudioInfo', () => {
    it('given a list of ids, it should make a call to an external API to get audio information', async () => {
      const IDs = ['1231435', '234234', '23432423', '234234']; // random set of ID's

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getAudioFeaturesForTracks.withArgs(IDs).returns({
        body: {
          audio_features: [
            {
              danceability: 1, energy: 1, valence: 1,
            },
            {
              danceability: 4, energy: 2, valence: 4,
            }],
        },
      });
      const expectedData = [{ danceability: 1, energy: 1, valence: 1 },
        { danceability: 4, energy: 2, valence: 4 }];
      const actualData = await getAudioInfo(IDs);

      assert.strictEqual(stubContainer.getAudioFeaturesForTracks.withArgs(IDs).callCount, 1);
      assert.deepStrictEqual(expectedData, actualData);
    });
  });

  describe('getAudioInfo', () => {
    it('given a list of ids, it should make a call to an external API, but API has an error', async () => {
      const IDs = ['1231435', '234234', '23432423', '234234']; // random set of ID's

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getAudioFeaturesForTracks.withArgs(IDs).throwsException('WebAPIError');
      assert.rejects(async () => { await getAudioInfo(IDs); }, Error);

      assert.strictEqual(stubContainer.getAudioFeaturesForTracks.withArgs(IDs).callCount, 1);
    });
  });

  describe('getBasicSongInfo', () => {
    it('given a list of ids, it should make a call to an external API to get song information', async () => {
      const IDs = ['1231435', '234234', '23432423', '234234']; // random set of ID's
      const startIndex = 1;
      const myTopHits = [
        {
          spotifyID: '111',
          albumID: '111',
          name: 'name',
          release: '2000',
          artists: [{ name: 'name' }],
          image: '/url',
          popularity: 10,
          previewURL: 20,
          artistRank: 3,
        }, {

          year: '2001',
          artists: [{ name: 'name' }],
          artistRank: 6,
        }, {

          year: '2003',
          artists: [{ name: 'name' }],
          artistRank: 9,

        },
      ];
      const expectedData = [
        {
          spotifyID: '222',
          albumID: 'a222',
          name: 'name2',
          release: '2001',
          artists: [{ name: 'name' }],
          image: '/url',
          popularity: 10,
          previewURL: 20,
          artistRank: 6,
        }, {
          spotifyID: '333',
          albumID: 'a333',
          name: 'name3',
          release: '2003',
          artists: [{ name: 'name' }],
          image: '/url2',
          popularity: 4,
          previewURL: 1,
          artistRank: 9,
        }];
      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getTracks.withArgs(IDs).returns({
        body: {
          tracks: [
            {
              id: '222',
              spotifyID: '222',
              album: {
                id: 'a222',
                images: [
                  { url: '/url' },
                ],
              },
              name: 'name2',
              popularity: 10,
              preview_url: 20,
              artistRank: 3,
              year: '2002',
            },
            {
              id: '333',
              spotifyID: '333',
              album: {
                id: 'a333',
                images: [
                  { url: '/url2' },
                ],
              },
              name: 'name3',
              popularity: 4,
              preview_url: 1,
              artistRank: 0,
              year: '2003',
            }],
        },
      });

      const actualData = await getBasicSongInfo(IDs, startIndex, myTopHits);

      assert.strictEqual(stubContainer.getTracks.withArgs(IDs).callCount, 1);
      assert.deepStrictEqual(expectedData, actualData);
    });
  });

  describe('getBasicSongInfo', () => {
    it('given a list of ids, it should make a call to an external API, but API has an error', async () => {
      const IDs = ['1231435', '234234', '23432423', '234234']; // random set of ID's
      const startIndex = 1;
      const myTopHits = [
        {
          spotifyID: '111',
          albumID: '111',
          name: 'name',
          release: '2000',
          artists: [{ name: 'name' }],
          image: '/url',
          popularity: 10,
          previewURL: 20,
          artistRank: 3,
        }, {

          release: '2001',
          artists: [{ name: 'name' }],
          artistRank: 3,
        }, {

          release: '2003',
          artists: [{ name: 'name' }],

        },
      ];

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getTracks.withArgs(IDs).throwsException('WebAPIError');
      assert.rejects(async () => { await getBasicSongInfo(IDs, startIndex, myTopHits); }, Error);

      assert.strictEqual(
        stubContainer.getTracks.withArgs(IDs).callCount, 1,
      );
    });
  });

  describe('getSongInformation', () => {
    it('given a song ids and artist ids, gets all information and adds it to the database', async () => {
      const songIDArray = ['1231435', '234234']; // random set of ID's
      const artistIDArray = ['1231435', '234234']; // random set of ID's
      const decade = '1980';
      const topHits = [
        {
          release: '2004',
          artists: 1,
          artistRank: 1,
        }, {

          release: '2001',
          artists: 1,
          artistRank: 3,
        },
      ];

      // stub our spotify api wrapper, getAudioInfo, getBasicSongInfo, getArtistInfo
      // stub our database method as well (different testing scope)
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      const audioInfoStub = sinon.stub(controllerStub, 'getAudioInfo').returns(
        [{ danceability: 1, energy: 1, valence: 1 },
          { danceability: 4, energy: 2, valence: 4 }],
      );

      spotifyController.__set__('getAudioInfo', audioInfoStub);

      const basicSongInfoStub = sinon.stub(controllerStub, 'getBasicSongInfo');

      basicSongInfoStub.onCall(0).returns([
        {
          spotifyID: '111',
          albumID: 'a111',
          name: 'name1',
          release: '2001',
          artists: 1,
          image: '/url',
          popularity: 10,
          previewURL: 20,
          artistRank: 6,
        }]);

      basicSongInfoStub.onCall(1).returns([
        {
          spotifyID: '222',
          albumID: 'a222',
          name: 'name2',
          release: '2002',
          artists: 1,
          image: '/url2',
          popularity: 12,
          previewURL: 20,
          artistRank: 7,
        }]);

      spotifyController.__set__('getBasicSongInfo', basicSongInfoStub);

      const getArtistInfoStub = sinon.stub(controllerStub, 'getArtistInfo').returns(
        [{ name: 'john doe', genres: 'pop', image: '/url' }, { name: 'jane doe', genres: 'rap', image: '/url' }],
      );
      spotifyController.__set__('getArtistInfo', getArtistInfoStub);
      // stub database call, we don't want any dummy data saved
      const databaseStub = sinon.stub(databaseController, 'addSongToDatabase').returns(
        true,
      );
      const data = await getSongInformation(decade, artistIDArray, songIDArray, topHits);

      assert.strictEqual(
        getArtistInfoStub.callCount, 1,
      );

      assert.strictEqual(
        basicSongInfoStub.callCount, 2,
      );

      assert.strictEqual(
        audioInfoStub.callCount, 1,
      );

      assert.strictEqual(
        databaseStub.callCount, 2,
      );
      const expectedData = [{
        spotifyID: '111',
        albumID: 'a111',
        name: 'name1',
        release: '2001',
        artists: [{ name: 'john doe', genres: 'pop', image: '/url' }],
        image: '/url',
        popularity: 10,
        previewURL: 20,
        artistRank: 6,
        audioData: { danceability: 1, energy: 1, valence: 1 },
      },
      {
        spotifyID: '222',
        albumID: 'a222',
        name: 'name2',
        release: '2002',
        artists: [{ name: 'jane doe', genres: 'rap', image: '/url' }],
        image: '/url2',
        popularity: 12,
        previewURL: 20,
        artistRank: 7,
        audioData: { danceability: 4, energy: 2, valence: 4 },
      },
      ];
      assert.deepStrictEqual(expectedData, data);
    });
  });

  describe('getUserSongAudioInformation', () => {
    it('gets audio information about users stop tracks and adds it to the db', async () => {
      const songIDs = ['1231435', '234234']; // random set of ID's
      const myTopHits = [
        {
          release: '2004',
          artists: 1,
          artistRank: 1,
        }, {

          release: '2001',
          artists: 1,
          artistRank: 3,
        },
      ];
      const databaseStub = sinon.stub(databaseController, 'addUserSongToDatabase').returns(
        true,
      );

      await getUserSongAudioInformation(myTopHits, songIDs, '1249123');

      assert.strictEqual(
        databaseStub.callCount, 2,
      );
    });
  });

  describe('getUserTopTracks', () => {
    it('gets top tracks for the user given a time range', async () => {
      const timeRange = 'long_term';

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getMyTopTracks.returns({
        body: {
          items: [
            {
              id: '111',
              name: 'song1',
              artists: [{ id: 10 }, { id: 5 }],
              popularity: 10,
              preview_url: '/url',
              album: { release_date: '01/01/2000', images: [{ url: 'url1' }] },
            },

            {
              id: '222',
              name: 'song2',
              artists: [{ id: 10 }, { id: 5 }],
              popularity: 20,
              preview_url: '/url2',
              album: { release_date: '01/01/2002', images: [{ url: 'url2' }] },
            }],
        },
      });

      const expectedID = ['111', '222'];
      const expectedArray = [{
        popularity: 10,
        name: 'song1',
        previewURL: '/url',
        release: '01/01/2000',
        artists: [{ name: 'john doe', genres: 'pop', image: '/url' }, { name: 'jane doe', genres: 'rap', image: '/url' }],
        imageUrl: 'url1',
        spotifyID: '111',
      }, {
        spotifyID: '222',
        popularity: 20,
        name: 'song2',
        previewURL: '/url2',
        release: '01/01/2002',
        artists: [{ name: 'john doe', genres: 'pop', image: '/url' }, { name: 'jane doe', genres: 'rap', image: '/url' }],
        imageUrl: 'url2',
      }];

      const { songIDArray, myTopHits } = await getUserTopTracks(timeRange, 3);
      assert.strictEqual(stubContainer.getMyTopTracks.callCount, 1);

      assert.deepStrictEqual(
        songIDArray, expectedID,
      );

      assert.deepStrictEqual(
        myTopHits, expectedArray,
      );
    });
  });
  describe('getUserTopTracks', () => {
    it('gets top tracks for the user given a time range, but throws an error', async () => {
      const timeRange = 'long_term';

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getMyTopTracks.throws('WebApiError');
      assert.rejects(async () => { await getUserTopTracks(timeRange, 3); }, Error);
    });
  });

  describe('getUserTopArtists', () => {
    it('gets top artists for the user given a time range', async () => {
      const timeRange = 'long_term';

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getMyTopArtists.withArgs({ time_range: timeRange, limit: 10 }).returns({
        body: {
          items: [
            {
              name: 'Jane Doe',
              images: [{ url: '1234' }],
              genres: 'pop',
            },

            {
              name: 'John Doe',
              images: [{ url: '1234' }],
              genres: 'pop',
            }],
        },
      });

      const topArtists = await getUserTopArtists(timeRange, 3);
      const expectedData = [
        {
          name: 'Jane Doe',
          image: '1234',
          genres: 'pop',
        },
        {
          name: 'John Doe',
          image: '1234',
          genres: 'pop',

        },
      ];

      assert.strictEqual(
        stubContainer.getMyTopArtists.withArgs({ time_range: timeRange, limit: 10 }).callCount, 1,
      );

      assert.deepStrictEqual(
        topArtists, expectedData,
      );
    });
  });
  describe('getUserTopArtists', () => {
    it('gets top artists for the user given a time range, but throws an error', async () => {
      const timeRange = 'long_term';

      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getMyTopArtists.throws('WebApiError');
      assert.rejects(async () => { await getUserTopArtists(timeRange, 3); }, Error);
    });
  });

  describe('getUserID', () => {
    it('gets spotify ID for the current user', async () => {
      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getMe.returns({ body: { id: 123 } });
      const id = await getUserID();
      assert.strictEqual(id, 123);
      assert.strictEqual(
        stubContainer.getMe.callCount, 1,
      );
    });
  });

  describe('getUserID', () => {
    it('gets spotify ID for the current user', async () => {
      // mock our spotify api wrapper
      const stubContainer = sinon.createStubInstance(SpotifyWebApi);
      spotifyController.__set__({ spotifyApi: stubContainer });

      stubContainer.getMe.returns({ body: { id: 123 } });
      const id = await getUserID();
      assert.strictEqual(id, 123);
      assert.strictEqual(
        stubContainer.getMe.callCount, 1,
      );
    });
  });
});
