require('dotenv').config();
const db = require('monk')(process.env.MONGO_DB);

console.log(process.env.MONGO_DB)

db.then(() => {
  console.log('Connected correctly to server')
});


const users = db.get('users')

users.find({})
  .each((user) => {
    console.log(user)
  });
