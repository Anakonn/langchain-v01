---
translated: true
---

# OpenAI

Chargeons la classe OpenAI Embedding.

## Configuration

Tout d'abord, nous installons langchain-openai et définissons les variables d'environnement requises.

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain_openai import OpenAIEmbeddings
```

```python
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
```

```python
text = "This is a test document."
```

## Utilisation

### Incorporer la requête

```python
query_result = embeddings.embed_query(text)
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
query_result[:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## Incorporer les documents

```python
doc_result = embeddings.embed_documents([text])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
doc_result[0][:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## Spécifier les dimensions

Avec la classe de modèles `text-embedding-3`, vous pouvez spécifier la taille des incorporations que vous souhaitez obtenir. Par exemple, par défaut, `text-embedding-3-large` renvoie des incorporations de dimension 3072 :

```python
len(doc_result[0])
```

```output
3072
```

Mais en passant `dimensions=1024`, nous pouvons réduire la taille de nos incorporations à 1024 :

```python
embeddings_1024 = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1024)
```

```python
len(embeddings_1024.embed_documents([text])[0])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```output
1024
```
