---
translated: true
---

# Baidu Cloud ElasticSearch VectorSearch

>[Baidu Cloud VectorSearch](https://cloud.baidu.com/doc/BES/index.html?from=productToDoc) est un service de recherche et d'analyse distribué de niveau entreprise, entièrement géré et 100% compatible avec l'open source. Baidu Cloud VectorSearch fournit des services de plateforme de récupération et d'analyse à faible coût, haute performance et fiables pour les données structurées/non structurées. En tant que base de données vectorielle, il prend en charge plusieurs types d'index et méthodes de distance de similarité.

>`Baidu Cloud ElasticSearch` fournit un mécanisme de gestion des privilèges, vous permettant de configurer librement les privilèges du cluster, afin d'assurer davantage la sécurité des données.

Ce notebook montre comment utiliser les fonctionnalités liées à `Baidu Cloud ElasticSearch VectorStore`.
Pour l'exécuter, vous devez avoir une instance [Baidu Cloud ElasticSearch](https://cloud.baidu.com/product/bes.html) active et en cours d'exécution :

Lisez le [document d'aide](https://cloud.baidu.com/doc/BES/s/8llyn0hh4) pour vous familiariser rapidement et configurer l'instance Baidu Cloud ElasticSearch.

Une fois l'instance active et en cours d'exécution, suivez ces étapes pour diviser les documents, obtenir les embeddings, vous connecter à l'instance baidu cloud elasticsearch, indexer les documents et effectuer une récupération vectorielle.

Nous devons d'abord installer les packages Python suivants.

```python
%pip install --upgrade --quiet  elasticsearch == 7.11.0
```

Tout d'abord, nous voulons utiliser `QianfanEmbeddings`, donc nous devons obtenir l'AK et le SK de Qianfan. Les détails de QianFan sont liés à [Baidu Qianfan Workshop](https://cloud.baidu.com/product/wenxinworkshop)

```python
import getpass
import os

os.environ["QIANFAN_AK"] = getpass.getpass("Your Qianfan AK:")
os.environ["QIANFAN_SK"] = getpass.getpass("Your Qianfan SK:")
```

Deuxièmement, divisez les documents et obtenez les embeddings.

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint()
```

Ensuite, créez une instance accessible à Baidu ElasticeSearch.

```python
# Create a bes instance and index docs.
from langchain_community.vectorstores import BESVectorStore

bes = BESVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    bes_url="your bes cluster url",
    index_name="your vector index",
)
bes.client.indices.refresh(index="your vector index")
```

Enfin, interrogez et récupérez les données

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = bes.similarity_search(query)
print(docs[0].page_content)
```

N'hésitez pas à contacter <liuboyao@baidu.com> ou <chenweixu01@baidu.com> si vous rencontrez des problèmes pendant l'utilisation, nous ferons de notre mieux pour vous soutenir.
