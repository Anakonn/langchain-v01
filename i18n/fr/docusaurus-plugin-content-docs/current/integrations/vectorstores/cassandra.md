---
translated: true
---

# Apache Cassandra

Cette page fournit un démarrage rapide pour utiliser [Apache Cassandra®](https://cassandra.apache.org/) en tant que Vector Store.

> [Cassandra](https://cassandra.apache.org/) est une base de données NoSQL, orientée lignes, hautement évolutive et hautement disponible. À partir de la version 5.0, la base de données est livrée avec des [capacités de recherche vectorielle](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html).

_Remarque : en plus de l'accès à la base de données, une clé API OpenAI est requise pour exécuter l'exemple complet._

### Configuration et dépendances générales

L'utilisation de l'intégration nécessite le package Python suivant.

```python
%pip install --upgrade --quiet "cassio>=0.1.4"
```

_Remarque : selon votre configuration LangChain, vous devrez peut-être installer/mettre à niveau d'autres dépendances nécessaires pour cette démonstration_
_(en particulier, des versions récentes de `datasets`, `openai`, `pypdf` et `tiktoken` sont requises, ainsi que `langchain-community`)._

```python
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```

```python
embe = OpenAIEmbeddings()
```

## Importer le Vector Store

```python
from langchain_community.vectorstores import Cassandra
```

## Paramètres de connexion

L'intégration Vector Store présentée dans cette page peut être utilisée avec Cassandra ainsi qu'avec d'autres bases de données dérivées, comme Astra DB, qui utilisent le protocole CQL (Cassandra Query Language).

> DataStax [Astra DB](https://docs.datastax.com/en/astra-serverless/docs/vector-search/quickstart.html) est une base de données serverless gérée basée sur Cassandra, offrant la même interface et les mêmes forces.

Selon que vous vous connectiez à un cluster Cassandra ou à Astra DB via CQL, vous fournirez différents paramètres lors de la création de l'objet vector store.

### Connexion à un cluster Cassandra

Vous devez d'abord créer un objet `cassandra.cluster.Session`, comme décrit dans la [documentation du pilote Cassandra](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster). Les détails varient (par exemple avec les paramètres réseau et l'authentification), mais cela pourrait ressembler à quelque chose comme :

```python
from cassandra.cluster import Cluster

cluster = Cluster(["127.0.0.1"])
session = cluster.connect()
```

Vous pouvez maintenant définir la session, ainsi que le nom de votre espace de travail souhaité, comme paramètre global CassIO :

```python
import cassio

CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")

cassio.init(session=session, keyspace=CASSANDRA_KEYSPACE)
```

Vous pouvez maintenant créer le vector store :

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

_Remarque : vous pouvez également transmettre votre session et votre espace de travail directement comme paramètres lors de la création du vector store. Utiliser le paramètre global `cassio.init`, cependant, s'avère pratique si votre application utilise Cassandra de plusieurs manières (par exemple, pour le vector store, la mémoire de chat et la mise en cache des réponses LLM), car cela permet de centraliser la gestion des identifiants et de la connexion à la base de données en un seul endroit._

### Connexion à Astra DB via CQL

Dans ce cas, vous initialisez CassIO avec les paramètres de connexion suivants :

- l'ID de la base de données, par exemple `01234567-89ab-cdef-0123-456789abcdef`
- le jeton, par exemple `AstraCS:6gBhNmsk135....` (il doit s'agir d'un jeton "Administrateur de base de données")
- Éventuellement, un nom d'espace de travail (s'il est omis, celui par défaut pour la base de données sera utilisé)

```python
ASTRA_DB_ID = input("ASTRA_DB_ID = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_keyspace = input("ASTRA_DB_KEYSPACE (optional, can be left empty) = ")
if desired_keyspace:
    ASTRA_DB_KEYSPACE = desired_keyspace
else:
    ASTRA_DB_KEYSPACE = None
```

```python
import cassio

cassio.init(
    database_id=ASTRA_DB_ID,
    token=ASTRA_DB_APPLICATION_TOKEN,
    keyspace=ASTRA_DB_KEYSPACE,
)
```

Vous pouvez maintenant créer le vector store :

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

## Charger un jeu de données

Convertissez chaque entrée du jeu de données source en un `Document`, puis écrivez-les dans le vector store :

```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

Dans ce qui précède, les dictionnaires `metadata` sont créés à partir des données source et font partie du `Document`.

Ajoutez quelques autres entrées, cette fois avec `add_texts` :

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_Remarque : vous voudrez peut-être accélérer l'exécution de `add_texts` et `add_documents` en augmentant le niveau de concurrence pour_
_ces opérations en bloc - consultez le paramètre `batch_size` des méthodes_
_pour plus de détails. Selon les spécifications du réseau et de la machine cliente, votre choix de paramètres offrant les meilleures performances peut varier._

## Exécuter des recherches

Cette section montre le filtrage des métadonnées et la récupération des scores de similarité :

```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### Recherche MMR (Maximal-marginal-relevance)

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

## Supprimer les documents stockés

```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```

```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## Une chaîne RAG minimale

Les cellules suivantes mettront en œuvre un pipeline RAG simple :
- télécharger un fichier PDF d'exemple et le charger sur le store ;
- créer une chaîne RAG avec LCEL (LangChain Expression Language), avec le vector store au cœur ;
- exécuter la chaîne de questions-réponses.

```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```

```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```

```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

Pour plus d'informations, consultez un modèle RAG complet utilisant Astra DB via CQL [ici](https://github.com/langchain-ai/langchain/tree/master/templates/cassandra-entomology-rag).

## Nettoyage

Ce qui suit récupère essentiellement l'objet `Session` de CassIO et exécute une instruction CQL `DROP TABLE` avec lui :

_(Vous perdrez les données que vous y avez stockées.)_

```python
cassio.config.resolve_session().execute(
    f"DROP TABLE {cassio.config.resolve_keyspace()}.cassandra_vector_demo;"
)
```

### En savoir plus

Pour plus d'informations, des démarrages rapides étendus et des exemples d'utilisation supplémentaires, veuillez consulter la [documentation CassIO](https://cassio.org/frameworks/langchain/about/) pour en savoir plus sur l'utilisation du vector store `Cassandra` de LangChain.

#### Déclaration d'attribution

> Apache Cassandra, Cassandra et Apache sont soit des marques déposées, soit des marques commerciales de l'[Apache Software Foundation](http://www.apache.org/) aux États-Unis et/ou dans d'autres pays.
