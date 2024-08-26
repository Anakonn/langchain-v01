---
translated: true
---

# Métal

>[Métal](https://github.com/getmetal/metal-python) est un service géré pour les intégrations ML.

Ce cahier montre comment utiliser le [récupérateur de Métal](https://docs.getmetal.io/introduction).

Tout d'abord, vous devrez vous inscrire à Métal et obtenir une clé API. Vous pouvez le faire [ici](https://docs.getmetal.io/misc-create-app)

```python
%pip install --upgrade --quiet  metal_sdk
```

```python
from metal_sdk.metal import Metal

API_KEY = ""
CLIENT_ID = ""
INDEX_ID = ""

metal = Metal(API_KEY, CLIENT_ID, INDEX_ID)
```

## Ingérer des documents

Vous ne devez faire cela que si vous n'avez pas encore configuré d'index

```python
metal.index({"text": "foo1"})
metal.index({"text": "foo"})
```

```output
{'data': {'id': '642739aa7559b026b4430e42',
  'text': 'foo',
  'createdAt': '2023-03-31T19:51:06.748Z'}}
```

## Requête

Maintenant que notre index est configuré, nous pouvons configurer un récupérateur et commencer à le requêter.

```python
from langchain_community.retrievers import MetalRetriever
```

```python
retriever = MetalRetriever(metal, params={"limit": 2})
```

```python
retriever.invoke("foo1")
```

```output
[Document(page_content='foo1', metadata={'dist': '1.19209289551e-07', 'id': '642739a17559b026b4430e40', 'createdAt': '2023-03-31T19:50:57.853Z'}),
 Document(page_content='foo1', metadata={'dist': '4.05311584473e-06', 'id': '642738f67559b026b4430e3c', 'createdAt': '2023-03-31T19:48:06.769Z'})]
```
