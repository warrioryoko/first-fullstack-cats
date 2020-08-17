const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

const fakeUser = {
  id: 1,
  email: 'iwona@hopkins.net',
  hash: 'grblbrbl12345',
};

app.get('/cats', async(req, res) => {
  const data = await client.query(`
      SELECT c.id, name, breed, age, fed_recently, t.favorite_toy AS favorite_toy
          FROM cats AS c
          JOIN toys AS t
          ON c.toy_id = t.id
          `);

  res.json(data.rows);
});

app.get('/toys', async(req, res) => {
  const data = await client.query('SELECT * FROM toys');

  res.json(data.rows);
});

app.get('/cats/:id', async(req, res) => {
  const catId = req.params.id;

  const data = await client.query(`
      SELECT c.id, name, breed, age, fed_recently, t.favorite_toy AS favorite_toy
          FROM cats AS c
          JOIN toys AS t
          ON c.toy_id=t.id
          WHERE c.id=$1
      `, [catId]);

  res.json(data.rows[0]);
});

app.delete('/cats/:id', async(req, res) => {
  const catId = req.params.id;

  const data = await client.query('DELETE FROM cats WHERE cats.id=$1;', [catId]);

  res.json(data.row[0]);
});

app.put('/cats/:id', async(req, res) => {
  const catId = req.params.id;

  try {
    const updatedCat = {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      fed_recently: req.body.fed_recently,
      toy_id: req.body.toy_id
    };

    const data = await client.query(`
      UPDATE cats
        SET name=$1, breed=$2, age=$3, fed_recently=$4, toy_id=$5
        WHERE cats.id =$6
        RETURNING *
        `, [updatedCat.name, updatedCat.breed, updatedCat.age, updatedCat.fed_recently, updatedCat.toy_id, catId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }});

app.post('/cats', async(req, res) => {
  try {
    const newCat = {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      fed_recently: req.body.fed_recently,
      toy_id: req.body.toy_id
    };
    console.log(newCat);
    const data = await client.query(`
    INSERT INTO cats(name, breed, age, fed_recently, owner_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `, [newCat.name, newCat.breed, newCat.age, newCat.fed_recently, fakeUser.id, newCat.toy_id]);
      
    res.json(data.rows[0]);
  } catch(e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
