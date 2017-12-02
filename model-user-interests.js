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
users.find({_id : ObjectId('5914764546d7c9003dbe0853')})
  .then(function (users) {
    users.forEach(function(user){
      console.log('user', user)
      // Instantiate interests
      const interests = {tag_interests : {}, category_interests : {}}

      // Get upvotes
      votes.find({userId : ObjectId(user._id)})
        .then(function (votes) {
          console.log('votes', votes)
          // Get the posts associated with those upvotes
          votes.forEach(function(vote){
            posts.findOne({_id : ObjectId(vote.postId)})
              .then(function (post){

                // Add tag interests
                post.tags.forEach(function(tag){
                  interests.tag_interests[tag] = 1
                })

                // Add category interests
                post.categories.forEach(function(category){
                  interests.category_interests[category] = 1
                })

            })
          })
        })

        // Add interests to db
        userInterests.update({userId: user._id},
          { interests, userId : user._id },
          { upsert: true } )
      })
    })

// Get the tags associated with those episodes
// Add the tags to user interests
