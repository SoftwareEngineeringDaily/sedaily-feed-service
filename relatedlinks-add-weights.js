require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})

/*
This script adds tags to the relatedLinks database
based on the tags associated with the post of the related link.
*/

// Instantiate databases
const relatedLinks = db.get('relatedlinks');
const posts = db.get('posts')
const tags = db.get('tags')
const relatedLinksWeightsDB = db.get('relatedlinks.weights')

// Get tags in memory
tags.find({})
  .then(function(tags) {
    let tagMap = {}
    tags.forEach((tag) => {
      if(tag.name.indexOf('.') == -1){
        tagMap[tag.id] = tag.name
      }
    })
    return tagMap
  })
  .then(function(tagMap){
    // Get the related links
    relatedLinks.find({})
      .then(function (links) {
        links.forEach(function(link){
          // Instantiate the weights
          const weights = {}

          posts.findOne({_id : link.post})
            .then(function (post) {
              if(post){
                // Add tag weights
                post.tags.forEach(function(tag){
                  const tagName = tagMap[tag]
                  if(tagName){
                    weights[tagName] = 1
                  }
                })

                // Add interests to db
                relatedLinksWeightsDB.insert({linkId: link._id, weights: weights } )
              }
             })
           })
         })
       })
