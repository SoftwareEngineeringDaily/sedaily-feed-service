This collection of scripts gathers links into a corpus and recommends them to users in a feed.

1. *model-user-interests.js*: finds the tags associated with things users have voted on, and adds those as weights to a user's interests. For example, if a user upvoted an episode about Bitcoin, the user will get modeled as having an interest in Bitcoin.
2. *relatedlinks-add-tags.js*: takes the related links (found in each podcast episode page) and associates those links with the tags of the episode.
3. *mine-unrelated-links.py*: scrapes popular tech sites for links; uses the descriptions of each link to give those links tags; aggregates those links into the unrelatedlinks collection.
4. *links-add-images.js*: adds an image to related and unrelated links
5. *related-links-add-description.js*: adds a description to the related links
6. *generate-feeds.py*: generates tag vectors for links; generates interest vectors for users; for each user, find the links that are closest in similarity to the interests of that user

*To use these locally*:
npm install

cp .env.example .env

Run each script in the order listed above.
