---
translated: true
---

# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/) est une base de données vectorielle distribuée multimode, qui combine les caractéristiques des lacs de données et des bases de données vectorielles, et peut stocker des données de tout type et de toute taille (Key-Value, PDF, audio, vidéo, etc.). Elle dispose de capacités de traitement en temps réel à faible latence pour atteindre une analyse et une réponse rapides, et peut effectuer efficacement une analyse instantanée et traiter des données multimodales.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle DingoDB.

Pour l'exécuter, vous devez avoir une [instance DingoDB en cours d'exécution](https://github.com/dingodb/dingo-deploy/blob/main/README.md).

```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["127.0.0.1:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )

# The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
docsearch = Dingo.from_documents(
    docs, embeddings, client=dingo_client, index_name=index_name
)
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

### Ajout de plus de texte à un index existant

Plus de texte peut être intégré et inséré dans un index Dingo existant à l'aide de la fonction `add_texts`

```python
vectorstore = Dingo(embeddings, "text", client=dingo_client, index_name=index_name)

vectorstore.add_texts(["More text!"])
```

### Recherches de pertinence marginale maximale

En plus d'utiliser la recherche de similarité dans l'objet de récupérateur, vous pouvez également utiliser `mmr` comme récupérateur.

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

Ou utilisez `max_marginal_relevance_search` directement :

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```
