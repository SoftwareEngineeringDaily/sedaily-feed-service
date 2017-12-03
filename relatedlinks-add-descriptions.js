require('dotenv').config();
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})


const getDescription = function(link,  cb) {

  var client = new MetaInspector(link.url, {});
  client.on("fetch", function(){
    let description = client.description;
    console.log("description", description);
    cb(null, description, link);
  });

  client.on("error", function(err){
    cb(err);
  });

  client.fetch();

  console.log('Trying to fetch...', link.url);
}


const relatedLinks = db.get('relatedlinks');

relatedLinks.find({description: null}).then(function(links) {
  // console.log('links', links);
  for(var ii = 0; ii < links.length; ii++) {
    const link = links[ii];

    getDescription(link,  function(error, description, _link) {

      if (error){ console.log('error', error); return; }
      if (!description || description.length == 0){ console.log('no description'); return; }
      relatedLinks.update({_id: _link._id}, {$set: {description}}).catch(function(err){
        console.log('err', error);
      });
    });
  }
})
