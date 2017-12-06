from pymongo import MongoClient
from bson.objectid import ObjectId
from scipy import spatial
# pprint library is used to make the output look more pretty
from pprint import pprint
# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient('localhost', 27017)
db = client['backup-11-19']

tags = []
users = []
links = []

for tag in db.tags.find():
    tags.append(tag["name"])

for user in db.users.find({"_id" : ObjectId('5914764546d7c9003dbe0853')}):
    users.append(user)

for link in db.relatedlinks.find():
    links.append(link)

linkVectors = {}
userVectors = {}

'''Make sparse tag array for each link'''
for link in links:
    linkTagSparseArray = [0] * len(tags)
    linkTags = link["weights"]
    for i in range(0, len(tags)):
        linkTagSparseArray[i] = 1 if (tags[i] in linkTags) else 0
    linkVectors[link["_id"]] = linkTagSparseArray

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
    linkRatings = []
    for link in links:
        linkVector = linkVectors[link["_id"]]
        distance = spatial.distance.euclidean(userVector, linkVector)
        ratedLink = {"_id" : link["_id"], "distance" : distance}
        linkRatings.append(ratedLink)
    sortedLinkRatings = sorted(linkRatings, key=lambda k: k['distance'])
    pprint(user["interests"])
    for i in range(0, 20):
        linkId = sortedLinkRatings[i]["_id"]
        for link in db.relatedlinks.find({"_id" : linkId}):
            pprint(link)
            print()
