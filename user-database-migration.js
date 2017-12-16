require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;
const db = require('monk')(process.env.MONGO_DB);

const users = db.get('users')

// Good test user IDs:
// ObjectId("597a06d7f0dc67003db0c4c0")
// ObjectId("59dfe18a7bb7f200285502df")
// ObjectId("5a04c04c0634300028d840e1")

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

users.find({_id : ObjectId("5a04c04c0634300028d840e1")})
  .then(function(users){
    users.forEach((user) => {



      if(!user.email){
        user.email = validateEmail(user.username) ? user.username : 'NO_EMAIL_ADDRESS'
      }

      if(!user.username){
        user.username = user.email
      }

      if(!user.name){
        user.firstName = 'Software'
        user.lastName = 'Engineer'
      }
      else {
        const firstSpace = user.name.indexOf(' ')
        if(firstSpace > -1){
          user.firstName = user.name.split(' ', 2)[0]
          user.lastName = user.name.substring(firstSpace, user.name.length)
        }
        else {
          user.firstName = user.name
          user.lastName = ' '
        }
      }

      console.log(user)

    })
  })
