require('dotenv').config();
const db = require('monk')(process.env.MONGO_DB);

console.log(process.env.MONGO_DB)

db.then(() => {
  console.log('Connected correctly to server')
});

const users = db.get('users')
const listeneds = db.get('listeneds');
const relatedLinks = db.get('relatedlinks');

const collectLinks = function(userId, podcastId) {
  console.log(userId, podcastId)
  relatedLinks.find({post: podcastId})
  .each((link) => {
    console.log('link', link);
  })
}

const loopThroughListens = function(user) {
  const userId = user._id;
  listeneds.find({userId})
    .each((listened) => {
      collectLinks(userId, listened.postId)
    })
};
users.find({})
  .each((user) => {
    loopThroughListens(user);
  });
