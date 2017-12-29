import os
from urllib import urlopen
from bs4 import BeautifulSoup
from pymongo import MongoClient
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import euclidean_distances
import textract

# Connect to DB
envHost = os.environ['MONGO_DB_HOST']
envPort = os.environ['MONGO_DB_PORT']
envDB = os.environ['MONGO_DB_DATABASE']
dbURL = 'mongodb://' + envHost + ':' + envPort + '/' + envDB
client = MongoClient(dbURL)
db = client.get_database()

transcriptBasePath = './transcripts/'
transcripts = []

for filename in os.listdir(transcriptBasePath):
    transcripts.append({'fileName' : filename})

corpus = []

for transcript in transcripts:
   path = transcript['fileName']
   text = textract.process(transcriptBasePath + path)
   corpus.append(text)
   
counts = vectorizer.fit_transform(corpus).toarray()
transformer = TfidfTransformer(smooth_idf=False)
tfidf = transformer.fit_transform(counts).toarray()

# Add the tfidf vectors to the transcriptFile objects
for i in range(0, len(transcripts)):

    transcript = transcripts[i]
    centroid = tfidf[i]

    distances = euclidean_distances([centroid], tfidf)
    title_distance_mappings = []

    for vi in range(0, len(transcripts)):
        v_title = transcripts[vi]["title"]
        distance_from_centroid = distances[0][vi]
        title_distance_mapping = {"title" : v_title, "distance" : distance_from_centroid}
        title_distance_mappings.append(title_distance_mapping)
    
    sorted_title_distance_mappings = sorted(title_distance_mappings, key=lambda k: k['distance'])
    transcripts[i]["title_distance_mappings"] = sorted_title_distance_mappings