from pymongo import MongoClient
from bson.objectid import ObjectId
from hackernews import HackerNews
import requests
from bs4 import BeautifulSoup

# pprint library is used to make the output look more pretty
from pprint import pprint
# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient('localhost', 27017)
db = client['backup-11-19']
hn = HackerNews()

links = []
tagSet = set()

# Make tag set
for tag in db.tags.find():
    tagSet.add(tag["name"].lower())

# Get new links
for story_id in hn.top_stories(limit=1000):
    item = hn.get_item(story_id)
    url = item.url
    try:
        response = requests.get(url)
    except:
        continue

    # Get description
    soup = BeautifulSoup(response.text)
    metas = soup.find_all('meta')
    try:
        descriptionArr = [ meta.attrs['content'] for meta in metas if 'name' in meta.attrs and meta.attrs['name'] == 'description' ]
    except:
        continue
    if len(descriptionArr) == 0:
        continue
    description = descriptionArr[0]

    # Find the tags associated with a description
    descriptionWordSet = set(description.split())
    tagsInDescription = descriptionWordSet & tagSet
    if len(tagsInDescription) == 0:
        continue
    
    # For each topic that is in the tagSet, add that as a weight
    weights = {}
    for tag in tagsInDescription:
        weights[tag] = 1

    # Write the links to the unrelated links database
    link = {
        "title" : item.title, 
        "url" : item.url,
        "weights" : weights 
        "description" : description}
        
    db.unrelatedlinks.insert_one(link)