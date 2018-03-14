require('dotenv').config()
const db = require('monk')(process.env.MONGO_DB)
const comments = db.get('comments')
const Bluebird = require('bluebird');

let promises = [];
comments.find( {root: {$exists: false}})
  .each((comment) => {
    const postId = comment.post;
    let promise = comments.update({id: comment.id}, {
      $set: {
        rootEntity: postId,
      }
    });
    console.log('comment', comment);
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
