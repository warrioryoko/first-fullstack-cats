const client = require('../lib/client');
// import our seed data:
const cats = require('./cats.js');
const usersData = require('./users.js');
const toysData = require('./toys.js');
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
      toysData.map(toy => {
        return client.query(`
                    INSERT INTO toys (favorite_toy)
                    VALUES ($1);
                    `,
        [toy.favorite_toy]);
      })
    );

    await Promise.all(
      cats.map(cat => {
        return client.query(`
                    INSERT INTO cats (name, breed, age, fed_recently, owner_id, toy_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [cat.name, cat.breed, cat.age, cat.fed_recently, user.id, cat.toy_id]);
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
