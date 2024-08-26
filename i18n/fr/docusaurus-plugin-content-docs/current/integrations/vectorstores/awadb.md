---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) est une base de données native IA pour la recherche et le stockage des vecteurs d'intégration utilisés par les applications LLM.

Ce notebook montre comment utiliser les fonctionnalités liées à `AwaDB`.

```python
%pip install --upgrade --quiet  awadb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AwaDB
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
db = AwaDB.from_documents(docs)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Recherche de similarité avec score

Le score de distance renvoyé est compris entre 0 et 1. 0 est dissimilaire, 1 est le plus similaire.

```python
docs = db.similarity_search_with_score(query)
```

```python
print(docs[0])
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), 0.561813814013747)
```

## Restaurer la table créée et ajouter des données avant

AwaDB persiste automatiquement les données de document ajoutées.

Si vous pouvez restaurer la table que vous avez créée et ajoutée auparavant, vous pouvez simplement faire cela comme ci-dessous :

```python
import awadb

awadb_client = awadb.Client()
ret = awadb_client.Load("langchain_awadb")
if ret:
    print("awadb load table success")
else:
    print("awadb load table failed")
```

awadb load table success
