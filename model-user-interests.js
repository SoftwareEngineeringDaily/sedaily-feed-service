require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})

/*
This script adds interests to the users database
based on the posts the user upvoted
*/

// Instantiate databases
const votes = db.get('votes')
const posts = db.get('posts')
const userDB = db.get('users')
const tags = db.get('tags')
const interestsDB = db.get('users.interests')
console.log(interestsDB)

// Get tags in memory
tags.find({})
  .then(function(tags) {
    let tagMap = {}
    tags.forEach((tag) => {
      // Tags with a . are hard to work with
      if(tag.name.indexOf('.') == -1){
        tagMap[tag.id] = tag.name
      }
    })
    return tagMap
  })
  .then(function(tagMap){

    // Get the users
    userDB.find({})
      .then(function (users) {
        users.forEach(function(user){
          // Instantiate interests
          const interests = {}

          // Get upvotes
          votes.find({$or : [{userId : user._id}, {userId : user._id.toString()}]})
            .then(function (votes) {
              // TODO Filter downvotes
              // Get the posts associated with those upvotes
              votes.forEach(function(vote){
                posts.findOne({_id : ObjectId(vote.postId)})
                  .then(function (post){
                    // Add tag interests
                    post.tags.forEach(function(tag){
                      const tagName = tagMap[tag]
                      interests[tagName] = 1
                    })

                    // Add interests to db
                    interestsDB.insert({userId: user._id,
                      interests : interests })
                  })
              })
            })
          })
        })
  })
