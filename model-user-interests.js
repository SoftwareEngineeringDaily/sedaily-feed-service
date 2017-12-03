require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})

// Instantiate databases
const votes = db.get('votes')
const posts = db.get('posts')
const users = db.get('users')
const userInterests = db.get('users.interests')


// Get the users
users.find({})
  .then(function (users) {
    users.forEach(function(user){
      console.log('user', user)
      // Instantiate interests
      const interests = {tag_interests : {}, category_interests : {}}

      // Get upvotes
      votes.find({$or : [{userId : user._id}, {userId : user._id.toString()}]})
        .then(function (votes) {
          //console.log('votes', votes)
          // Get the posts associated with those upvotes
          votes.forEach(function(vote){
            posts.findOne({_id : ObjectId(vote.postId)})
              .then(function (post){
                console.log('tags', post.tags)
                // Add tag interests
                post.tags.forEach(function(tag){
                  interests.tag_interests[tag] = 1
                })

                // Add category interests
                post.categories.forEach(function(category){
                  interests.category_interests[category] = 1
                })

                // Add interests to db
                userInterests.update({userId: user._id},
                  { interests, userId : user._id },
                  { upsert: true } )
            })
          })
        })
      })
    })

// Get the tags associated with those episodes
// Add the tags to user interests
