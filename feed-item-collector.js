require('dotenv').config();
const db = require('monk')(process.env.MONGO_DB);

console.log(process.env.MONGO_DB)

db.then(() => {
  console.log('Connected correctly to server')
});

const users = db.get('users')
const listeneds = db.get('listeneds');

const loopThroughListens = function(user) {
  const id = user._id;
  listeneds.find({userId: id})
    .each((listened) => {
      console.log(listened)
    })
};
users.find({})
  .each((user) => {
    loopThroughListens(user);
  });
