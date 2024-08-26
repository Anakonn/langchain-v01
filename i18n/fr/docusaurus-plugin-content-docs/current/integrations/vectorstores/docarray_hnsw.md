---
translated: true
---

# DocArray HnswSearch

>[DocArrayHnswSearch](https://docs.docarray.org/user_guide/storing/index_hnswlib/) est une implémentation d'index de documents légère fournie par [Docarray](https://github.com/docarray/docarray) qui s'exécute entièrement localement et convient le mieux aux jeux de données de petite à moyenne taille. Il stocke les vecteurs sur le disque dans [hnswlib](https://github.com/nmslib/hnswlib) et stocke toutes les autres données dans [SQLite](https://www.sqlite.org/index.html).

Ce notebook montre comment utiliser les fonctionnalités liées à `DocArrayHnswSearch`.

## Configuration

Décommentez les cellules ci-dessous pour installer docarray et obtenir/définir votre clé d'API OpenAI si vous ne l'avez pas déjà fait.

```python
%pip install --upgrade --quiet  "docarray[hnswlib]"
```

```python
# Get an OpenAI token: https://platform.openai.com/account/api-keys

# import os
# from getpass import getpass

# OPENAI_API_KEY = getpass()

# os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## Utilisation de DocArrayHnswSearch

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import DocArrayHnswSearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = DocArrayHnswSearch.from_documents(
    docs, embeddings, work_dir="hnswlib_store/", n_dim=1536
)
```

### Recherche de similarité

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### Recherche de similarité avec score

Le score de distance renvoyé est la distance cosinus. Par conséquent, un score plus faible est meilleur.

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={}),
 0.36962226)
```

```python
import shutil

# delete the dir
shutil.rmtree("hnswlib_store")
```
