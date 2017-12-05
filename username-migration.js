require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;
const db = require('monk')(process.env.MONGO_DB);

const users = db.get('users')

// Good test user IDs:
// ObjectId("597a06d7f0dc67003db0c4c0")
// ObjectId("59dfe18a7bb7f200285502df")
// ObjectId("5a04c04c0634300028d840e1")

// This is not working
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

users.find({})
  .then(function(users){


    console.log('Starting modification: -------------------------');
    users.forEach((user) => {

      if(user.username != null) {
        if(user.username.length !== user.username.trim().length) {
          console.log(':: Untrimmed username', user.username);
        }
      }

      if(user.emails  != null) {
        if(user.email.length !== user.email.trim().length) {
          console.log(':: Untrimmed email', user.email);
        }
      }
    });


    if(user.email == null){
      if(validateEmail(user.username) ) {
        user.email = user.username;
      } else {
        // This will happen if they signed up with the old website:
        // or before we checked for valid emails:
        console.log('Not an actual email as username but email is false: ',  user.createdAt, '\t', user._id, '\t', user.username, '\t\t\t',  user.email);
        if(user.username.indexOf('@') > 0) {
          console.log('----!!!! Is probably an actual email but untrimmed?  raw username char count: ', user.username.length, 'after trim', user.username.trim().length);
          usernameAsEmailsTrimmedCountNotMatching ++;
        }

      }
    }

    if(user.name == null){
      user.name  = 'Software Engineer'
    }

    // user.save();

  })
  .catch((error) => {
    console.log('Error: ----------------', error);
  });

