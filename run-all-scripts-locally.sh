#!/bin/bash  
MONGO_DB=localhost/backup-11-19
MONGO_DB_HOST=localhost
MONGO_DB_DATABASE=backup-11-19
MONGO_DB_PORT=27017

echo "Starting model-user-interests.js"
node model-user-interests.js & model_interests_pid=$!
sleep 5
echo "Killing model-user-interests.js"
kill $model_interests_pid

echo "Starting mine-unrelated-links.py"
python mine-unrelated-links.py
echo "finished mining unrelated links"

echo "Starting generate-feeds.py"
python generate-feeds.py
echo "finished generating feeds"