import unicodedata
import requests
import datetime
import os
import operator
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

tagMap = {}
tagSet = set()

# Make tag set and tag map
for tag in db.tags.find():
    tagSet.add(tag["name"].lower())
    # Make tag map to get back to correct casing
    tagMap[tag["name"].lower()] = tag["name"]

links = []
bagOfWords = {}

# Get new links
for story_id in hn.top_stories(limit=10):
    item = hn.get_item(story_id)
    url = item.url

    # Check if link is already in database
    if db.unrelatedlinks.find_one({'url' : item.url}) is not None:
        print url + " is already in the DB"
        continue

    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text)
        body = soup.find('body').getText()
    except:
        continue
    
    '''First topic modeling method: make bag of words map, find top topics
        (if any) from among the bag of words.'''

    contentTag = None

    # Make bag of words map
    wordsArr = body.split()
    for word in wordsArr:
        word = word.encode('ascii','ignore').lower()
        if word in bagOfWords:
            bagOfWords[word] += 1
        else:
            bagOfWords[word] = 1
    sortedBag = sorted(bagOfWords.items(), key = operator.itemgetter(1))
    sortedBag.reverse()
    for i in range(0, len(sortedBag)):
        if sortedBag[i][0] in tagSet:
            contentTag = sortedBag[i][0]
            break

    # Get description
    metas = soup.find_all('meta')
    try:
        descriptionArr = [ meta.attrs['content'] for meta in metas if 'name' in meta.attrs and meta.attrs['name'] == 'description' ]
    except:
        continue
    if len(descriptionArr) == 0:
        continue
    description = descriptionArr[0]

    # Find the tags associated with link's description and/or title
    descriptionWordSet = set(description.split()).union(set(item.title.split()))
    tagsInDescription = descriptionWordSet & tagSet
    if len(tagsInDescription) == 0 and contentTag is None:
        continue
    
    # For each topic that is in the tagSet, add that as a weight
    weights = {}
    if contentTag is not None:
        correctCaseTag = tagMap[contentTag]
        weights[correctCaseTag] = 1

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