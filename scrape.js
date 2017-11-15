const  MetaInspector  = require('meta-scrape');

var client = new MetaInspector("http://www.google.com", {});
 
client.on("fetch", function(){
    console.log("Description: " + client.description);
    console.log("Description: " + client.image);
 
    console.log("Links: " + client.links.join(","));
});
 
client.on("error", function(err){
    console.log(error);
});
 
client.fetch();

