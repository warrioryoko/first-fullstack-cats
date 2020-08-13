require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns cats', async() => {

    const expectation = [
      {
        id: 1,
        name: 'pinky',
        breed: 'russian grey',
        age: 2,
        fed_recently: true,
      },
      {
        id: 2,
        name: 'charler',
        breed: 'tabby',
        age: 1,
        fed_recently: true,
      },
      {
        id: 3,
        name: 'mister cam',
        breed: 'burmese',
        age: 3,
        fed_recently: false,
      },
      {
        id: 4,
        name: 'hugo',
        breed: 'american bobtail',
        age: 5,
        fed_recently: true,
      },
      {
        id: 5,
        name: 'reagan',
        breed: 'munchkin',
        age: 3,
        fed_recently: true,
      }
    ];

    const data = await fakeRequest(app)
      .get('/cats')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
