require('dotenv').config()
const db = require('monk')(process.env.MONGO_DB)
const forumthreads = db.get('forumthreads')
const Bluebird = require('bluebird');

let promises = [];
forumthreads.find( {_id: "_________SOME_______ID"})
  .each((entity) => {
    console.log('entity', entity);
    let promise = forumthreads.update({_id: entity._id}, {
      $set: {
        deleted: true,
      }
    });
    console.log('entity', entity);
    promises.push(promise);
  })
  .then(() => {
    return Bluebird.all(promises);
    // return
  })
  .then(() => {
    console.log("done");
    process.exit();
  })
  .catch((error) => { console.log(error); })
