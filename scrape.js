const  MetaInspector  = require('meta-scrape');

var client = new MetaInspector("https://www.google.com", {});
 
client.on("fetch", function(){
    console.log("image: " + client.image);
    console.log("images: " + client.images);
});
 
client.on("error", function(err){
    console.log(error);
});
 
client.fetch();

