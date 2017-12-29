import os
from urllib import urlopen
from bs4 import BeautifulSoup
from pymongo import MongoClient
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import euclidean_distances

# Connect to DB
envHost = os.environ['MONGO_DB_HOST']
envPort = os.environ['MONGO_DB_PORT']
envDB = os.environ['MONGO_DB_DATABASE']
dbURL = 'mongodb://' + envHost + ':' + envPort + '/' + envDB
client = MongoClient(dbURL)
db = client.get_database()

vectorizer = CountVectorizer()
corpus = []
links = []

NUM_LINKS = 50

for link in db.unrelatedlinks.find():
    if NUM_LINKS == 0:
        break
    NUM_LINKS -= 1
    links.append(link)
    url = link["url"]
    response = urlopen(url)
    html = response.read()
    soup = BeautifulSoup(html, "html5lib")
    text = soup.get_text(strip=True)
    corpus.append(text)

vectorizer = CountVectorizer()
counts = vectorizer.fit_transform(corpus).toarray()
feature_names = vectorizer.get_feature_names()

transformer = TfidfTransformer(smooth_idf=False)
tfidf = transformer.fit_transform(counts).toarray()

# Add the tfidf vectors to the link objects
for i in range(0, len(links)):

    link = links[i]
    centroid = tfidf[i]
    centroid_description = link["description"]

    distances = euclidean_distances([centroid], tfidf)
    description_distance_mappings = []

    for vi in range(0, len(links)):
        v_description = links[vi]["description"]
        distance_from_centroid = distances[0][vi]
        description_distance_mapping = {"description" : v_description, "distance" : distance_from_centroid}
        description_distance_mappings.append(description_distance_mapping)
    
    sorted_description_distance_mappings = sorted(description_distance_mappings, key=lambda k: k['distance'])
    links[i]["description_distance_mappings"] = sorted_description_distance_mappings