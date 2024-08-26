---
translated: true
---

# viking DB

>[viking DB](https://www.volcengine.com/docs/6459/1163946) est une base de données qui stocke, indexe et gère des vecteurs d'intégration massifs générés par des réseaux de neurones profonds et d'autres modèles d'apprentissage automatique (ML).

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données de vecteurs VikingDB.

Pour l'exécuter, vous devez avoir une [instance VikingDB en cours d'exécution](https://www.volcengine.com/docs/6459/1165058).

```python
!pip install --upgrade volcengine
```

Nous voulons utiliser VikingDBEmbeddings, donc nous devons obtenir la clé API VikingDB.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.document_loaders import TextLoader
from langchain_community.vectorstores.vikingdb import VikingDB, VikingDBConfig
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loader = TextLoader("./test.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    drop_old=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
docs[0].page_content
```

### Compartimentez les données avec les collections viking DB

Vous pouvez stocker différents documents non liés dans différentes collections au sein de la même instance viking DB pour maintenir le contexte.

Voici comment vous pouvez créer une nouvelle collection.

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
    drop_old=True,
)
```

Et voici comment vous pouvez récupérer cette collection stockée.

```python
db = VikingDB.from_documents(
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
)
```

Après la récupération, vous pouvez continuer à l'interroger comme d'habitude.
