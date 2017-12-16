require('dotenv').config();
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})


const getImage = function(link,  cb) {

  var client = new MetaInspector(link.url, {});
  client.on("fetch", function(){
    let image = client.image;
    if (!image || image.length == 0) {
      if (client.images && client.images.length > 0) {
        image = client.images[0];
      } else {
        return cb('No image');
      }
    }
    cb(null, image, link);
  });

  client.on("error", function(err){
    cb(err);
  });

  client.fetch();

  console.log('Trying to fetch...', link.url);
}


const relatedLinks = db.get('relatedlinks');
const unrelatedLinks = db.get('unrelatedlinks');

relatedLinks.find({image: null}).then(function(links) {
  // console.log('links', links);
  for(var ii = 0; ii < links.length; ii++) {
    const link = links[ii];
    // TODO: stagger the fetching of images:

    getImage(link,  function(error, image, _link) {

      if (error){ console.log('error', error); return; }
      if (!image || image.length == 0){ console.log('no image'); return; }
      console.log('got iamge!');
      relatedLinks.update({_id: _link._id}, {$set: {image }}).catch(function(err){
        console.log('err', error);
      });
    });
  }
})

unrelatedLinks.find({image: null}).then(function(links) {
  // console.log('links', links);
  for(var ii = 0; ii < links.length; ii++) {
    const link = links[ii];
    // TODO: stagger the fetching of images:

    getImage(link,  function(error, image, _link) {

      if (error){ console.log('error', error); return; }
      if (!image || image.length == 0){ console.log('no image'); return; }
      console.log('got iamge!');
      unrelatedLinks.update({_id: _link._id}, {$set: {image }}).catch(function(err){
        console.log('err', error);
      });
    });
  }
})
