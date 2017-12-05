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
    var usernameToEmailTransfers = 0;
    var invalidUsernameAsEmails  = 0;
    var impossibleBlankUsernames = 0;
    var blankNames = 0;


    users.forEach((user) => {

      // This should not be possible....
      if(user.username == null && user.email){
        user.username = user.email
        console.log('This should not be possible.. username === null????------------');
        impossibleBlankUsernames++;
      } 


      if(user.email == null){
        if(validateEmail(user.username) ) {
          user.email = user.username;
          usernameToEmailTransfers++;
        } else {
          // This will happen if they signed up with the old website:
          // or before we checked for valid emails:
          console.log('Not an actual email as username but email is false: ',  user.createdAt, '\t', user._id, '\t', user.username, '\t\t\t',  user.email);
          invalidUsernameAsEmails++;
        }
      }


      if(user.name == null){
        user.name  = 'Software Engineer'
        blankNames++;
      }

      // console.log(user)

    });
    console.log('Report: -----------');
    console.log('usernameToEmailTransfers', usernameToEmailTransfers);
    console.log('invalidUsernameAsEmails', invalidUsernameAsEmails);
    console.log('impossibleBlankUsernames', impossibleBlankUsernames);
    console.log('blankNames', blankNames);
    console.log('Report END: -----------');

  })
