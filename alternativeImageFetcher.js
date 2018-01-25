const htmlToJson  = require('html-to-json');
const _ = require('lodash');



const url ='https://techcrunch.com/2018/01/09/the-ever-ending-story/';
  var promise = htmlToJson.request(url, {
    'images': ['img', function ($img) {
      return $img.attr('src');
    }]
  }, function (err, result) {
    if(err) {
      console.log('errrrrr........', err);
    } else {
    console.log('result', result);
    }
  });
