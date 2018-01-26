const htmlToJson  = require('html-to-json');
const _ = require('lodash');


const getBestImage = function(images) {
  if(images == null || images.legnth == 0 ) return null;
  let  bestImage = images[0];
  _.each(images, function(image) {
    if(image.indexOf('.png') > 0 || 
       image.indexOf('.jpeg') > 0 || 
       image.indexOf('.jpg') > 0
      ) { 
        bestImage = image;
      }
  });
  return bestImage;
}


const url ='https://techcrunch.com/2018/01/09/the-ever-ending-story/';

const getImageForUrl = function(url) {
  var p = new Promise(function( resolve, reject)  { 
    htmlToJson.request(url, {
      'images': ['img', function ($img) {
        return $img.attr('src');
      }]
    }, function (err, result) {
      if(err) {
        reject(err);
      } else {
        const images = result.images;
        const bestImage = getBestImage(images);
        if (bestImage == null ) {
          reject('No image found');
        } else {
          resolve(bestImage);
        }
      }
    });
  });
  return p;
}

getImageForUrl(url).then(function(image) {
  console.log('Found image:', image);
})
.catch(function(error) {
  console.log('-------Error fetching image:', error);
});

