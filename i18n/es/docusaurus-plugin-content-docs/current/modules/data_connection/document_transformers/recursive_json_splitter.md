---
translated: true
---

# Dividir JSON recursivamente

Este divisor de json recorre los datos json en profundidad primero y construye fragmentos json más pequeños. Intenta mantener los objetos json anidados completos, pero los dividirá si es necesario para mantener los fragmentos entre un min_chunk_size y el max_chunk_size. Si el valor no es un json anidado, sino más bien una cadena muy grande, la cadena no se dividirá. Si necesita un límite máximo estricto en el tamaño del fragmento, considere seguir esto con un divisor de texto recursivo en esos fragmentos. Hay un paso de preprocesamiento opcional para dividir listas, primero convirtiéndolas en json (dict) y luego dividiéndolas como tal.

1. Cómo se divide el texto: valor json.
2. Cómo se mide el tamaño del fragmento: por número de caracteres.

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
