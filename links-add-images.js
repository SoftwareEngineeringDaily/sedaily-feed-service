// Script to add images to links that do not have one

require('dotenv').config();
let Promise = require('bluebird');
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})


// Refacor:
//

const getImage = function(link) {
  const p = new Promise(function(resolve, reject){
    var client = new MetaInspector(link.url, {});
    client.on("fetch", function(){
      let image = client.image;
      if (!image || image.length == 0) {
        if (client.images && client.images.length > 0) {
          image = client.images[0];
        } else {
          return reject('No image found');
        }
      }
      resolve({image, link});
    });

    client.on("error", function(error){
      return reject(error);
    });

    client.fetch();
    console.log('Trying to fetch...', link.url);
  });
  return p;
}


const relatedLinks = db.get('relatedlinks');
const unrelatedLinks = db.get('unrelatedlinks');

const createLinkPromises = function(links) {
  let promises = [];
  for(var ii = 0; ii < links.length; ii++) {
    const link = links[ii];
    // TODO: stagger the fetching of images:

    const p = getImage(link)
    .then(function({image, link})  {
      return unrelatedLinks.update({_id: link._id}, {$set: {image }})
    })
    .catch(function(error){
      console.log('err', error);
    });
    promises.push(p);
  }
  return promises;
}


// This will get us a link array for each:
const getRelatedLinkPromise = relatedLinks.find({image: null});
const getUnrelatedLinksPromise = unrelatedLinks.find({image: null});

Promise.all([getRelatedLinkPromise, getUnrelatedLinksPromise ])
.then( (linkArrays) => {

  // Let's Merge our arrays
  links = [];
  for(var ii = 0; ii < linkArrays.length; ii++) {
    links = links.concat(linkArrays[ii]);
  }

  return Promise.all(createLinkPromises(links));
})
.then((results) => {
  console.log('Done :)-----------');
})
.catch((error) => {
  console.log('all done?--- Error', error)
})
.finally(()=> {
  console.log('Finally');
  process.exit();
})

// Refactor this code
// Ideas --> get another image scraping library
// Get a library to grab all img tags and just pull the firs tone
