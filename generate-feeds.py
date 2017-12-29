import os
import urllib
from pymongo import MongoClient
from bson.objectid import ObjectId
from scipy import spatial
# pprint library is used to make the output look more pretty
from pprint import pprint

envHost = os.environ['MONGO_DB_HOST']
envPort = os.environ['MONGO_DB_PORT']
envDB = os.environ['MONGO_DB_DATABASE']

#TODO find out how to connect to localhost mongo client using MONGO_DB env var
#because production and staging have weird URLs
dbURL = 'mongodb://' + envHost + ':' + envPort + '/' + envDB

print "CONNECTING TO " + dbURL

client = MongoClient(dbURL)
db = client.get_database()

print "CONNECTED TO " + dbURL

tags = []
users = []
relatedLinks = []
unrelatedLinks = []

for tag in db.tags.find():
    tags.append(tag["name"])

for user in db.users.find():
    userInterests = db.users.interests.find_one({"userId" : user["_id"]})
    if(userInterests is not None):
        user["interests"] = userInterests
        users.append(user)

for link in db.relatedlinks.find():
    relatedLinks.append(link)

for link in db.unrelatedlinks.find():
    unrelatedLinks.append(link)

relatedLinkVectors = {}
unrelatedLinkVectors = {}
userVectors = {}

'''Make sparse tag array for each link'''
for link in relatedLinks:
    linkTagSparseArray = [0] * len(tags)
    linkTags = link["weights"]
    for i in range(0, len(tags)):
        linkTagSparseArray[i] = 1 if (tags[i] in linkTags) else 0
    relatedLinkVectors[link["_id"]] = linkTagSparseArray

for link in unrelatedLinks:
    linkTagSparseArray = [0] * len(tags)
    linkTags = link["weights"]
    for i in range(0, len(tags)):
        linkTagSparseArray[i] = 1 if (tags[i] in linkTags) else 0
    unrelatedLinkVectors[link["_id"]] = linkTagSparseArray

'''Make sparse tag array for each user'''
for user in users:
    userTagSparseArray = [0] * len(tags)
    userTags = user["interests"]
    for i in range(0, len(tags)):
        userTagSparseArray[i] = 1 if (tags[i] in userTags) else 0
    userVectors[user["_id"]] = userTagSparseArray

'''Use distance to rank links for each user'''
for user in users:
    userVector = userVectors[user["_id"]]
    
    relatedLinkRatings = []
    for link in relatedLinks:
        linkVector = relatedLinkVectors[link["_id"]]
        distance = spatial.distance.euclidean(userVector, linkVector)
        ratedLink = {"_id" : link["_id"], "distance" : distance}
        relatedLinkRatings.append(ratedLink)
    sortedRelatedLinkRatings = sorted(relatedLinkRatings, key=lambda k: k['distance'])

    unrelatedLinkRatings = []
    for link in unrelatedLinks:
        linkVector = unrelatedLinkVectors[link["_id"]]
        distance = spatial.distance.euclidean(userVector, linkVector)
        ratedLink = {"_id" : link["_id"], "distance" : distance}
        unrelatedLinkRatings.append(ratedLink)
    sortedUnrelatedLinkRatings = sorted(unrelatedLinkRatings, key=lambda k: k['distance'])

    # Create sorted feed from 1/2 related links, 1/2 unrelated links
    sortedFeed = []
    relatedLinkIndex = 0
    unrelatedLinkIndex = 0
    feedSize = 100
    for i in range(0, feedSize):
        if(i % 2 == 0):
            linkId = sortedRelatedLinkRatings[relatedLinkIndex]["_id"]
            relatedLinkIndex += 1
            for link in db.relatedlinks.find({"_id" : linkId}):
                sortedFeed.append(link)
        else:
            linkId = sortedUnrelatedLinkRatings[relatedLinkIndex]["_id"]
            unrelatedLinkIndex += 1
            for link in db.unrelatedlinks.find({"_id" : linkId}):
                sortedFeed.append(link)

    db.feeds.update({"user" : user["_id"]}, {
        '$set': {'feedItems' : sortedFeed}}, upsert=True)
