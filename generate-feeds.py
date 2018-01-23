import os
from pymongo import MongoClient
from pprint import pprint
import random

# envHost = os.environ['MONGO_DB_HOST']
# envPort = os.environ['MONGO_DB_PORT']
# envDB = os.environ['MONGO_DB_DATABASE']
mongoDB = os.environ['MONGO_DB']
# dbURL = 'mongodb://' + envHost + ':' + envPort + '/' + envDB
dbURL = 'mongodb://' + mongoDB
client = MongoClient(dbURL)
db = client.get_database()

feed = []

# Add 20 random related links
related_links = []
for related_link in db.relatedlinks.find():
    related_links.append(related_link)
for i in range(0, 20):
    rand = random.randint(0, len(related_links) - 1)
    feed.append(related_links[rand])

# Add 80 most recent unrelated links
unrelated_links = []
for link in db.unrelatedlinks.find({"$query":{}, "$orderby": {"date" : -1}}):    
    if(len(feed) == 100):
        break
    feed.append(link)

random.shuffle(feed)

for user in db.users.find():
    user_id = user["_id"]
    db.feeds.update({"user" : user_id}, {"user" : user_id, "feedItems" : feed}, upsert=True)
