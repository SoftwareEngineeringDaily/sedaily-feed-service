import requests
import datetime
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from hackernews import HackerNews
from bs4 import BeautifulSoup
from pprint import pprint

envHost = os.environ['MONGO_DB_HOST']
envPort = os.environ['MONGO_DB_PORT']
envDB = os.environ['MONGO_DB_DATABASE']

hn = HackerNews()

#TODO find out how to connect to localhost mongo client using MONGO_DB env var
#because production and staging have weird URLs
dbURL = 'mongodb://' + envHost + ':' + envPort + '/' + envDB

print "CONNECTING TO " + dbURL

client = MongoClient(dbURL)
db = client.get_database()

print "CONNECTED TO " + dbURL

links = []
tagMap = {}
tagSet = set()

# Make tag set and tag map
for tag in db.tags.find():
    tagSet.add(tag["name"].lower())
    # Make tag map to get back to correct casing
    tagMap[tag["name"].lower()] = tag["name"]

# Get new links
for story_id in hn.top_stories(limit=1000):
    item = hn.get_item(story_id)
    url = item.url
    print item

    # Check if link is already in database
    if db.unrelatedlinks.find_one({'url' : item.url}) is not None:
        continue

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
        correctCaseTag = tagMap[tag]
        weights[correctCaseTag] = 1

    # Write the links to the unrelated links database
    link = {
        "title" : item.title, 
        "url" : item.url,
        "weights" : weights, 
        "description" : description,
        "dateCreated" : datetime.datetime.now()
        }

    print link

    db.unrelatedlinks.insert_one(link)