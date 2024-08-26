---
translated: true
---

# USearch

>[USearch](https://unum-cloud.github.io/usearch/) est un moteur de recherche vectorielle plus petit et plus rapide en un seul fichier

>La fonctionnalité de base d'USearch est identique à FAISS, et l'interface devrait vous sembler familière si vous avez déjà étudié la recherche des plus proches voisins approximatifs. FAISS est une norme largement reconnue pour les moteurs de recherche vectorielle haute performance. USearch et FAISS utilisent tous deux le même algorithme HNSW, mais ils diffèrent considérablement dans leurs principes de conception. USearch est compact et largement compatible sans sacrifier les performances, avec un accent mis sur les métriques définies par l'utilisateur et moins de dépendances.

```python
%pip install --upgrade --quiet  usearch
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import USearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = USearch.from_documents(docs, embeddings)

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

## Recherche de similarité avec score

La méthode `similarity_search_with_score` vous permet de renvoyer non seulement les documents, mais aussi le score de distance de la requête à ceux-ci. Le score de distance renvoyé est la distance L2. Par conséquent, un score plus faible est meilleur.

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../extras/modules/state_of_the_union.txt'}),
 0.1845687)
```
