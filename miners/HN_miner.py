from pymongo import MongoClient
import diffbot
from hackernews import HackerNews
import os

envHost = os.environ['MONGO_DB_HOST']
envPort = os.environ['MONGO_DB_PORT']
envDB = os.environ['MONGO_DB_DATABASE']
dbURL = 'mongodb://' + envHost + ':' + envPort + '/' + envDB
client = MongoClient(dbURL)
db = client.get_database()
hn = HackerNews()
diffbot_token = os.environ['DIFFBOT_TOKEN']
diffbot_client = diffbot.Client(token=diffbot_token)

links = []

# Get new links
for story_id in hn.top_stories(limit=1000):
    item = hn.get_item(story_id)
    url = item.url
    # Check if link is already in database
    if db.unrelatedlinks.find_one({'url' : item.url}) is not None:
        continue
    try:
        result = diffbot_client.api('article', url)
        title = result["objects"][0]["title"]
        text = result["objects"][0]["text"]
        date = result["objects"][0]["date"]
        tags = []
        try:
            for obj in result["objects"][0]["tags"]:
                tags.append(obj["label"])
        except:
            continue
        link = {"title":title,"text":text, "date":date,"tags":tags, "url":url}
        db.unrelatedlinks.insert(link)
        print(link)
    except:
        continue