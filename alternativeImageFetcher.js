const htmlToJson  = require('html-to-json');
const _ = require('lodash');
const validUrl = require('valid-url');


const getImageAsUrl = function(imageUrl, url) {
  if(url[url.length -1 ] === '/') {
    return url.substr(0, url.length-1) + imageUrl;
  } else {
    return url + imageUrl;
  }
}

const getBestImage = function(images, url) {
  if(images == null || images.legnth == 0 ) return null;
  let  bestImage = images[0];
  _.each(images, function(image) {
    if(image.indexOf('.png') > 0 || 
       image.indexOf('.jpeg') > 0 || 
       image.indexOf('.jpg') > 0
      ) { 
        if(image.indexOf('http') === 0 || image.indexOf('www') === 0) {
          bestImage = image;
        }
      }
  });

  // If not a URI:
  if(bestImage.indexOf('/') === 0 ) {
    bestImage = getImageAsUrl(bestImage, url);
  }
  
  if( !validUrl.isUri(bestImage) ) {
    cosole.log('Invalid image url---------------------', bestImage, ' --url: ', url);
    return null;
  }
  
  return bestImage;
}



// const url ='http://google.com/';
// const url ='https://techcrunch.com/2018/01/09/the-ever-ending-story/';
// const url = 'https://community.letsencrypt.org/t/2018-01-09-issue-with-tls-sni-01-and-shared-hosting-infrastructure/49996'
// const url = 'https://www.bloomberg.com/news/articles/2018-01-10/chinese-workers-abandon-silicon-valley-for-riches-back-home'
const url = 'http://kakaroto.homelinux.net/2017/11/introduction-to-reverse-engineering-and-assembly/'

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
        const bestImage = getBestImage(images, url);
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

