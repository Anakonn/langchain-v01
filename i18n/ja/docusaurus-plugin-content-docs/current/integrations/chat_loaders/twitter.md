---
translated: true
---

# Twitter (via Apify)

このノートブックでは、Apifyを使ってTwitterからチャットメッセージをロードし、微調整する方法を示します。

まず、Apifyを使ってツイートをエクスポートします。例

```python
import json

from langchain_community.adapters.openai import convert_message_to_dict
from langchain_core.messages import AIMessage
```

```python
with open("example_data/dataset_twitter-scraper_2023-08-23_22-13-19-740.json") as f:
    data = json.load(f)
```

```python
# Filter out tweets that reference other tweets, because it's a bit weird
tweets = [d["full_text"] for d in data if "t.co" not in d["full_text"]]
# Create them as AI messages
messages = [AIMessage(content=t) for t in tweets]
# Add in a system message at the start
# TODO: we could try to extract the subject from the tweets, and put that in the system message.
system_message = {"role": "system", "content": "write a tweet"}
data = [[system_message, convert_message_to_dict(m)] for m in messages]
```
