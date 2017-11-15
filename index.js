require('dotenv').config()
const db = require('monk')(process.env.MONGO_DB)


const relatedLinks = db.get('relatedlinks')

const linksCount = 2;
relatedLinks.find({}, {limit: linksCount, sort: {score: 1}}).then(function (items) {
  console.log('items', items);
  // sorted by name field
})

