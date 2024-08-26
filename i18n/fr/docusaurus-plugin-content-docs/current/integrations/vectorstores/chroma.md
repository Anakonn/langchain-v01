---
translated: true
---

# Chroma

>[Chroma](https://docs.trychroma.com/getting-started) est une base de données vectorielle open-source native de l'IA, axée sur la productivité et le bonheur des développeurs. Chroma est sous licence Apache 2.0.

Installez Chroma avec :

```sh
pip install langchain-chroma
```

Chroma fonctionne dans différents modes. Voir ci-dessous pour des exemples de chacun intégrés à LangChain.
- `in-memory` - dans un script Python ou un notebook Jupyter
- `in-memory avec persistance` - dans un script ou un notebook et enregistrer/charger sur le disque
- `dans un conteneur Docker` - en tant que serveur s'exécutant sur votre machine locale ou dans le cloud

Comme toute autre base de données, vous pouvez :
- `.add`
- `.get`
- `.update`
- `.upsert`
- `.delete`
- `.peek`
- et `.query` exécute la recherche de similarité.

Consultez la documentation complète sur [docs](https://docs.trychroma.com/reference/Collection). Pour accéder directement à ces méthodes, vous pouvez faire `._collection.method()`

## Exemple de base

Dans cet exemple de base, nous prenons le discours sur l'état de l'Union le plus récent, le divisons en morceaux, l'incorporons à l'aide d'un modèle d'incorporation open-source, le chargeons dans Chroma, puis le requêtons.

```python
# import
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# load it into Chroma
db = Chroma.from_documents(docs, embedding_function)

# query it
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# print results
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Exemple de base (incluant l'enregistrement sur le disque)

En prolongeant l'exemple précédent, si vous voulez enregistrer sur le disque, il suffit d'initialiser le client Chroma et de passer le répertoire où vous voulez que les données soient enregistrées.

`Attention` : Chroma fait de son mieux pour enregistrer automatiquement les données sur le disque, cependant plusieurs clients en mémoire peuvent arrêter le travail des autres. Comme meilleure pratique, n'ayez qu'un seul client par chemin en cours d'exécution à un moment donné.

```python
# save to disk
db2 = Chroma.from_documents(docs, embedding_function, persist_directory="./chroma_db")
docs = db2.similarity_search(query)

# load from disk
db3 = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)
docs = db3.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Passer un client Chroma à Langchain

Vous pouvez également créer un client Chroma et le passer à LangChain. Cela est particulièrement utile si vous voulez un accès plus facile à la base de données sous-jacente.

Vous pouvez également spécifier le nom de la collection que vous voulez que LangChain utilise.

```python
import chromadb

persistent_client = chromadb.PersistentClient()
collection = persistent_client.get_or_create_collection("collection_name")
collection.add(ids=["1", "2", "3"], documents=["a", "b", "c"])

langchain_chroma = Chroma(
    client=persistent_client,
    collection_name="collection_name",
    embedding_function=embedding_function,
)

print("There are", langchain_chroma._collection.count(), "in the collection")
```

```output
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Insert of existing embedding ID: 1
Add of existing embedding ID: 2
Insert of existing embedding ID: 2
Add of existing embedding ID: 3
Insert of existing embedding ID: 3

There are 3 in the collection
```

## Exemple de base (utilisation du conteneur Docker)

Vous pouvez également exécuter le serveur Chroma dans un conteneur Docker séparément, créer un client pour s'y connecter, puis le passer à LangChain.

Chroma a la capacité de gérer plusieurs `Collections` de documents, mais l'interface LangChain en attend une seule, nous devons donc spécifier le nom de la collection. Le nom de collection par défaut utilisé par LangChain est "langchain".

Voici comment cloner, construire et exécuter l'image Docker :

```sh
git clone git@github.com:chroma-core/chroma.git
```

Modifiez le fichier `docker-compose.yml` et ajoutez `ALLOW_RESET=TRUE` sous `environment`

```yaml
    ...
    command: uvicorn chromadb.app:app --reload --workers 1 --host 0.0.0.0 --port 8000 --log-config log_config.yml
    environment:
      - IS_PERSISTENT=TRUE
      - ALLOW_RESET=TRUE
    ports:
      - 8000:8000
    ...
```

Puis exécutez `docker-compose up -d --build`

```python
# create the chroma client
import uuid

import chromadb
from chromadb.config import Settings

client = chromadb.HttpClient(settings=Settings(allow_reset=True))
client.reset()  # resets the database
collection = client.create_collection("my_collection")
for doc in docs:
    collection.add(
        ids=[str(uuid.uuid1())], metadatas=doc.metadata, documents=doc.page_content
    )

# tell LangChain to use our client and collection name
db4 = Chroma(
    client=client,
    collection_name="my_collection",
    embedding_function=embedding_function,
)
query = "What did the president say about Ketanji Brown Jackson"
docs = db4.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Mise à jour et suppression

Lors de la construction d'une véritable application, vous voulez aller au-delà de l'ajout de données et également mettre à jour et supprimer des données.

Chroma demande aux utilisateurs de fournir des `ids` pour simplifier la comptabilité ici. Les `ids` peuvent être le nom du fichier ou un hash combiné comme `filename_paragraphNumber`, etc.

Chroma prend en charge toutes ces opérations - bien que certaines d'entre elles soient encore en cours d'intégration dans l'interface LangChain. Des améliorations supplémentaires du workflow seront bientôt ajoutées.

Voici un exemple de base montrant comment effectuer diverses opérations :

```python
# create simple ids
ids = [str(i) for i in range(1, len(docs) + 1)]

# add data
example_db = Chroma.from_documents(docs, embedding_function, ids=ids)
docs = example_db.similarity_search(query)
print(docs[0].metadata)

# update the metadata for a document
docs[0].metadata = {
    "source": "../../modules/state_of_the_union.txt",
    "new_value": "hello world",
}
example_db.update_document(ids[0], docs[0])
print(example_db._collection.get(ids=[ids[0]]))

# delete the last document
print("count before", example_db._collection.count())
example_db._collection.delete(ids=[ids[-1]])
print("count after", example_db._collection.count())
```

```output
{'source': '../../../state_of_the_union.txt'}
{'ids': ['1'], 'embeddings': None, 'metadatas': [{'new_value': 'hello world', 'source': '../../../state_of_the_union.txt'}], 'documents': ['Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.']}
count before 46
count after 45
```

## Utiliser les incorporations OpenAI

Beaucoup de gens aiment utiliser OpenAIEmbeddings, voici comment le configurer.

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

from langchain_openai import OpenAIEmbeddings

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
embeddings = OpenAIEmbeddings()
new_client = chromadb.EphemeralClient()
openai_lc_client = Chroma.from_documents(
    docs, embeddings, client=new_client, collection_name="openai_collection"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = openai_lc_client.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

***

## Autres informations

### Recherche de similarité avec score

Le score de distance renvoyé est la distance cosinus. Par conséquent, un score plus faible est meilleur.

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 1.1972057819366455)
```

### Options de récupérateur

Cette section passe en revue les différentes options pour utiliser Chroma comme récupérateur.

#### MMR

En plus d'utiliser la recherche de similarité dans l'objet récupérateur, vous pouvez également utiliser `mmr`.

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

### Filtrage sur les métadonnées

Il peut être utile de réduire la collection avant de travailler avec elle.

Par exemple, les collections peuvent être filtrées sur les métadonnées à l'aide de la méthode get.

```python
# filter collection for updated source
example_db.get(where={"source": "some_other_source"})
```

```output
{'ids': [], 'embeddings': None, 'metadatas': [], 'documents': []}
```
