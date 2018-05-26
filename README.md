## -------------
## Deprecated 
## -------------
Still need to migrate:

```node links-add-images.js```

and


``` node links-add-descriptions.js```
## ------------------------------------------------------


This collection of scripts gathers links into a corpus and recommends them to users in a feed.

1. *miners/HN_miner.py*: scrapes links from Hacker News for the unrelated links collection
2. *links-add-images.js*: adds an image to related and unrelated links
3. *links-add-description.js*: adds a description to any links that don't have one
4. *generate-feeds.py*: creates very basic feed naively

*To use these locally*:

npm install

cp .env.example .env

Run each script in the order listed above.





# Installation of Python

pip install -r ./requirements.txt



# Notes

python --version

If using conda / multiple python versions



python2.7 -m pip install -r ./requirements.txt


# Running locally


 MONGO_DB=localhost/express-mongoose-es6-rest-api-development  python2.7 generate-feeds.py
