require('dotenv').config();
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})


let  feeds = db.get('feeds');
// First we clear our feeds collecion
feeds.drop();
feeds = db.create('feeds');

const relatedLinks = db.get('relatedlinks');
const users = db.get('users');

const linksCount = 2;
relatedLinks.find({}, {limit: linksCount, sort: {score: 1}})
  .then(function (links) {
    // sorted by name field
    // TODO: paginate users:
    return users.find({}).then(function(users){
      return {users, links}
    });
  })
  .then(function({users, links}) {
    for(let ii = 0; ii < users.length; ii++) {
      const user = users[ii];
      // TODO: filter links:
      const item = {userId: user._id, links};
      console.log('inserting?');

      feeds.insert([item]).then(function(docs){
        console.log('inserted', docs);
      })
      .catch(function(error) {
        console.log('error', error);
      });
    }

  });




  /*
  db.close();
  process.exit();
  return;
   */
