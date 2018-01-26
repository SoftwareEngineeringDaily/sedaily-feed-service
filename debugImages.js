// Script to add images to links that do not have one

const _ = require('lodash');

require('dotenv').config();


let Promise = require('bluebird');
const db = require('monk')(process.env.MONGO_DB);
db.then(() => {
  console.log('Connected correctly to server')
})


// const relatedLinks = db.get('relatedlinks');
const relatedLinks = db.get('unrelatedlinks');
relatedLinks.find({url: 'http://kakaroto.homelinux.net/2017/11/introduction-to-reverse-engineering-and-assembly/'}).each(function(result) {
  console.log('url', result.url);
  console.log('image', result.image);
})
.then((r) => {
  console.log('r', r);
})
.catch((err) => {
  console.log('err', err);
});

