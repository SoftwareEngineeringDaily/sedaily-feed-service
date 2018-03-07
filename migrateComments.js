require('dotenv').config()
const db = require('monk')(process.env.MONGO_DB)
const comments = db.get('comments')
const getUrls = require('get-urls');
const Bluebird = require('bluebird');
const rp = require('request-promise');

let promises = [];
comment.find( {root: {$exists: false}})
  .each((comment) => {
    const postId = comment.post;
    let promise = comment.update({id: comment.id}, {
      $set: {
        root: postId,
      },
    });
    promises.push(promise);
  })
  .then(() => {
    return Bluebird.all(promises);
  })
  .then(() => {
    console.log("done");
    process.exit();
  })
  .catch((error) => { console.log(error); })
