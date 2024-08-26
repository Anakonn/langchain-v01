---
translated: true
---

# Récursivement diviser le JSON

Ce diviseur JSON parcourt les données JSON en profondeur d'abord et construit des morceaux JSON plus petits. Il tente de garder les objets JSON imbriqués entiers mais les divisera si nécessaire pour garder les morceaux entre une taille de morceau minimale et maximale. Si la valeur n'est pas un JSON imbriqué, mais plutôt une chaîne très longue, la chaîne ne sera pas divisée. Si vous avez besoin d'une limite supérieure stricte sur la taille du morceau, envisagez de le suivre d'un diviseur de texte récursif sur ces morceaux. Il y a une étape de pré-traitement facultative pour diviser les listes, en les convertissant d'abord en JSON (dict) puis en les divisant comme tel.

1. Comment le texte est divisé : valeur JSON.
2. Comment la taille du morceau est mesurée : par nombre de caractères.

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
