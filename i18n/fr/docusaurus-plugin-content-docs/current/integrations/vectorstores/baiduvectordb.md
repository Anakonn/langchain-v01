---
translated: true
---

# Baidu VectorDB

>[Baidu VectorDB](https://cloud.baidu.com/product/vdb.html) est un service de base de données distribuée robuste et de niveau entreprise, développé avec soin et entièrement géré par Baidu Intelligent Cloud. Il se distingue par sa capacité exceptionnelle à stocker, récupérer et analyser des données vectorielles multidimensionnelles. Au cœur de VectorDB se trouve le noyau de base de données vectorielle propriétaire de Baidu, "Mochow", qui garantit des performances, une disponibilité et une sécurité élevées, ainsi qu'une évolutivité et une convivialité remarquables.

>Ce service de base de données prend en charge une grande variété de types d'index et de méthodes de calcul de similarité, répondant à divers cas d'utilisation. Une caractéristique remarquable de VectorDB est sa capacité à gérer une échelle vectorielle immense allant jusqu'à 10 milliards, tout en maintenant des performances de requête impressionnantes, prenant en charge des millions de requêtes par seconde (QPS) avec une latence de requête de l'ordre de la milliseconde.

Ce notebook montre comment utiliser les fonctionnalités liées à Baidu VectorDB.

Pour l'exécuter, vous devez avoir une [instance de base de données.](https://cloud.baidu.com/doc/VDB/s/hlrsoazuf).

```python
!pip3 install pymochow
```

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import BaiduVectorDB
from langchain_community.vectorstores.baiduvectordb import ConnectionParams
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = FakeEmbeddings(size=128)
```

```python
conn_params = ConnectionParams(
    endpoint="http://192.168.xx.xx:xxxx", account="root", api_key="****"
)

vector_db = BaiduVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, drop_old=True
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```python
vector_db = BaiduVectorDB(embeddings, conn_params)
vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```
