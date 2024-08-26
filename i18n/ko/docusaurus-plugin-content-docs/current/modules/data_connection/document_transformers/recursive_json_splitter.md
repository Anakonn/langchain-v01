---
translated: true
---

# JSON 재귀적 분할

이 JSON 분할기는 JSON 데이터를 깊이 우선으로 탐색하고 더 작은 JSON 청크를 구축합니다. 중첩된 JSON 객체를 전체적으로 유지하려고 시도하지만 min_chunk_size와 max_chunk_size 사이에 청크를 유지하기 위해 필요한 경우 분할합니다. 값이 중첩된 JSON이 아니라 매우 큰 문자열인 경우 문자열은 분할되지 않습니다. 청크 크기에 대한 하드 캡이 필요한 경우 이 후에 해당 청크에 대한 재귀적 텍스트 분할기를 따르는 것을 고려해 보세요. 목록을 먼저 JSON(dict)으로 변환한 다음 이와 같이 분할하는 선택적 전처리 단계가 있습니다.

1. 텍스트가 분할되는 방식: JSON 값.
2. 청크 크기가 측정되는 방식: 문자 수.

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
