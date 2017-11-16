npm install

cp .env.example .env

// This script tries to update the database for each link with an image:  
node relatedlinks-add-images.js

// This script actually creates the user feeds:
node index.js
