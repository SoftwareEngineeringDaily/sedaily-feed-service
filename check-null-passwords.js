require('dotenv').config();
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})


const relatedLinks = db.get('users');

relatedLinks.find({password: null}).then(function(links) {
   console.log('links', links);
   console.log('links length', links.length);
})
.then(function(){
  console.log('Done');
  db.close();
  process.exit();
  return;
});
