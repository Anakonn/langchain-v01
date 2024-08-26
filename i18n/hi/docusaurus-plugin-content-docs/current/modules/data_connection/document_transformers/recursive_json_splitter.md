---
translated: true
---

# JSON को पुनर्कृत रूप से विभाजित करें

यह JSON स्प्लिटर JSON डेटा को गहराई से पहले से ही खोजता है और छोटे JSON टुकड़े बनाता है। यह प्रयास करता है कि घुमावदार JSON ऑब्जेक्ट को पूरा रखे लेकिन यदि आवश्यक हो तो उन्हें विभाजित कर देगा ताकि टुकड़े min_chunk_size और max_chunk_size के बीच रहें। यदि मान एक घुमावदार JSON नहीं है, बल्कि एक बहुत बड़ा स्ट्रिंग है, तो स्ट्रिंग को नहीं बांटा जाएगा। यदि आप टुकड़े के आकार पर एक कठोर सीमा चाहते हैं, तो उन टुकड़ों पर एक पुनर्कृत पाठ स्प्लिटर का पालन करें। सूचियों को पहले JSON (डिक्शनरी) में परिवर्तित करके और फिर उन्हें इस प्रकार विभाजित करके एक वैकल्पिक पूर्व-प्रसंस्करण चरण है।

1. पाठ कैसे विभाजित किया जाता है: JSON मान।
2. टुकड़े का आकार कैसे मापा जाता है: अक्षरों की संख्या द्वारा।

```python
%pip install -qU langchain-text-splitters
```

```python
import json

import requests
```

```python
# This is a large nested json object and will be loaded as a python dict
json_data = requests.get("https://api.smith.langchain.com/openapi.json").json()
```

```python
from langchain_text_splitters import RecursiveJsonSplitter
```

```python
splitter = RecursiveJsonSplitter(max_chunk_size=300)
```

```python
# Recursively split json data - If you need to access/manipulate the smaller json chunks
json_chunks = splitter.split_json(json_data=json_data)
```

```python
# The splitter can also output documents
docs = splitter.create_documents(texts=[json_data])

# or a list of strings
texts = splitter.split_text(json_data=json_data)

print(texts[0])
print(texts[1])
```

```output
{"openapi": "3.0.2", "info": {"title": "LangChainPlus", "version": "0.1.0"}, "paths": {"/sessions/{session_id}": {"get": {"tags": ["tracer-sessions"], "summary": "Read Tracer Session", "description": "Get a specific session.", "operationId": "read_tracer_session_sessions__session_id__get"}}}}
{"paths": {"/sessions/{session_id}": {"get": {"parameters": [{"required": true, "schema": {"title": "Session Id", "type": "string", "format": "uuid"}, "name": "session_id", "in": "path"}, {"required": false, "schema": {"title": "Include Stats", "type": "boolean", "default": false}, "name": "include_stats", "in": "query"}, {"required": false, "schema": {"title": "Accept", "type": "string"}, "name": "accept", "in": "header"}]}}}}
```

```python
# Let's look at the size of the chunks
print([len(text) for text in texts][:10])

# Reviewing one of these chunks that was bigger we see there is a list object there
print(texts[1])
```

```output
[293, 431, 203, 277, 230, 194, 162, 280, 223, 193]
{"paths": {"/sessions/{session_id}": {"get": {"parameters": [{"required": true, "schema": {"title": "Session Id", "type": "string", "format": "uuid"}, "name": "session_id", "in": "path"}, {"required": false, "schema": {"title": "Include Stats", "type": "boolean", "default": false}, "name": "include_stats", "in": "query"}, {"required": false, "schema": {"title": "Accept", "type": "string"}, "name": "accept", "in": "header"}]}}}}
```

```python
# The json splitter by default does not split lists
# the following will preprocess the json and convert list to dict with index:item as key:val pairs
texts = splitter.split_text(json_data=json_data, convert_lists=True)
```

```python
# Let's look at the size of the chunks. Now they are all under the max
print([len(text) for text in texts][:10])
```

```output
[293, 431, 203, 277, 230, 194, 162, 280, 223, 193]
```

```python
# The list has been converted to a dict, but retains all the needed contextual information even if split into many chunks
print(texts[1])
```

```output
{"paths": {"/sessions/{session_id}": {"get": {"parameters": [{"required": true, "schema": {"title": "Session Id", "type": "string", "format": "uuid"}, "name": "session_id", "in": "path"}, {"required": false, "schema": {"title": "Include Stats", "type": "boolean", "default": false}, "name": "include_stats", "in": "query"}, {"required": false, "schema": {"title": "Accept", "type": "string"}, "name": "accept", "in": "header"}]}}}}
```

```python
# We can also look at the documents
docs[1]
```

```output
Document(page_content='{"paths": {"/sessions/{session_id}": {"get": {"parameters": [{"required": true, "schema": {"title": "Session Id", "type": "string", "format": "uuid"}, "name": "session_id", "in": "path"}, {"required": false, "schema": {"title": "Include Stats", "type": "boolean", "default": false}, "name": "include_stats", "in": "query"}, {"required": false, "schema": {"title": "Accept", "type": "string"}, "name": "accept", "in": "header"}]}}}}')
```
