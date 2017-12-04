from pymongo import MongoClient
from bson.objectid import ObjectId
# pprint library is used to make the output look more pretty
from pprint import pprint
# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient('localhost', 27017)
db = client['sed-test']

tags = []
users = []
links = []

for tag in db.tags.find():
    tags.append(tag["name"])

for user in db.users.find({"_id" : ObjectId("5a1d881a63ac5d23eda635ae")}):
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

pprint(linkVectors)

'''Make sparse tag array for each user'''
for user in users:
    userTagSparseArray = [0] * len(tags)
    userTags = user["interests"]
    for i in range(0, len(tags)):
        userTagSparseArray[i] = 1 if (tags[i] in userTags) else 0
    userVectors[user["_id"]] = userTagSparseArray

pprint(userVectors)

'''Use KNN'''
