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

const linksCount = 50; // How many links do we put in our feed

relatedLinks.find({}, {limit: linksCount, sort: {score: -1}})
  .then(function (links) {
    // sorted by name field
    // TODO: paginate users:
    return users.find({}).then(function(users){
      return {users, links}
    });
  })
  .then(function({users, links}) {
    const items = [];
    for(let ii = 0; ii < users.length; ii++) {
      const user = users[ii];
      // TODO: filter links:
      const item = {userId: user._id, links};
      items.push(item);
    }

    return feeds.insert(items).then(function(docs){
      console.log('Inserted all docs!');
    })
    .catch(function(error) {
      console.log('error', error);
    });


  })
  .then(function(){
    console.log('Done');
    db.close();
    process.exit();
    return;
  });


  /*
   */
