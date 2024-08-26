---
translated: true
---

# Atlas

>[Atlas](https://docs.nomic.ai/index.html) est une plateforme créée par Nomic pour interagir avec des jeux de données non structurés, à petite et grande échelle. Elle permet à n'importe qui de visualiser, de rechercher et de partager des jeux de données massifs dans leur navigateur.

Ce notebook vous montre comment utiliser les fonctionnalités liées à la `AtlasDB` vectorstore.

```python
%pip install --upgrade --quiet  spacy
```

```python
!python3 -m spacy download en_core_web_sm
```

```python
%pip install --upgrade --quiet  nomic
```

### Charger les packages

```python
import time

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AtlasDB
from langchain_text_splitters import SpacyTextSplitter
```

```python
ATLAS_TEST_API_KEY = "7xDPkYXSYDc1_ErdTPIcoAR9RNd8YDlkS3nVNXcVoIMZ6"
```

### Préparer les données

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = SpacyTextSplitter(separator="|")
texts = []
for doc in text_splitter.split_documents(documents):
    texts.extend(doc.page_content.split("|"))

texts = [e.strip() for e in texts]
```

### Cartographier les données à l'aide de l'Atlas de Nomic

```python
db = AtlasDB.from_texts(
    texts=texts,
    name="test_index_" + str(time.time()),  # unique name for your vector store
    description="test_index",  # a description for your vector store
    api_key=ATLAS_TEST_API_KEY,
    index_kwargs={"build_topic_model": True},
)
```

```python
db.project.wait_for_project_lock()
```

```python
db.project
```

Voici une carte avec le résultat de ce code. Cette carte affiche les textes du discours sur l'état de l'Union.
https://atlas.nomic.ai/map/3e4de075-89ff-486a-845c-36c23f30bb67/d8ce2284-8edb-4050-8b9b-9bb543d7f647
