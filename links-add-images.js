// Script to add images to links that do not have one

const cheerio = require('cheerio');
const htmlToJson  = require('html-to-json');
const _ = require('lodash');

const axios = require('axios');
var diffbotToken = 'ccaea83a6ab30fcd64dc8579613edba3';


require('dotenv').config();
let Promise = require('bluebird');
const  MetaInspector  = require('meta-scrape');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})

const getImage2 = function(link) {

  const p = new Promise(function(resolve, reject){
    let url = link.url;
    console.log('link.url', url);
    if (url && url.indexOf('http') == 0 ) {
    } else {
      url  =  'http://' + url;
      console.log('modified url', url);
    }

    // Regular function
    var options = {
      params: {'token': diffbotToken, url}
    };

    axios.get('https://api.diffbot.com/v3/image', options)
    .then(({data}) => {
      _.each(data.objects, (obj ) {
        if(obj.type === 'image') {

          console.log('Found an image:**********', image);
          return resolve(obj.url);
        }
      });
      reject('No image found')
    })
    .catch((error)=> {
      console.log('diffbot error-----------', error);
      return reject(error);
    })
  });
  return p;
}


// Deprecrated
const getImage = function(link) {
  const p = new Promise(function(resolve, reject){
    var client = new MetaInspector(link.url, {});
    client.on("fetch", function(){
      let image = client.image;
      if (!image || image.length == 0) {
        return getImage2(link);
        // return reject({error:'No image found', link});

      } else {
        console.log('Found an image:**********', image);
        resolve({image, link});
      }
    });

    client.on("error", function(error){
      return getImage2(link);
      // return reject({error, link});
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
      return unrelatedLinks.update({_id: link._id}, {$set: {image}})
    })
    .catch(function({error, link}){
      console.log('::::::::::::err', error);
      // getImage2(link);
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
  // process.exit();
})

// Refactor this code
// Ideas --> get another image scraping library
// Get a library to grab all img tags and just pull the firs tone
