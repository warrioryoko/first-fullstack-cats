const client = require('../lib/client');
// import our seed data:
const cats = require('./cats.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      cats.map(cat => {
        return client.query(`
                    INSERT INTO cats (id, name, breed, age, fed_recently)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [cat.id, cat.name, cat.breed, cat.age, cat.fed_recently]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
