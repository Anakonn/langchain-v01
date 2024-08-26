---
translated: true
---

# Astra DB

Cette page fournit un démarrage rapide pour utiliser [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) en tant que Vector Store.

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) est une base de données vectorielle serverless construite sur Apache Cassandra® et rendue facilement accessible via une API JSON simple d'utilisation.

_Remarque : en plus de l'accès à la base de données, une clé API OpenAI est requise pour exécuter l'exemple complet._

## Configuration et dépendances générales

L'utilisation de l'intégration nécessite le package Python correspondant :

```python
pip install --upgrade langchain-astradb
```

_**Remarque.** les éléments suivants sont tous les packages requis pour exécuter la démonstration complète sur cette page. Selon votre configuration LangChain, certains d'entre eux peuvent devoir être installés :_

```python
pip install langchain langchain-openai datasets pypdf
```

### Importer les dépendances

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
from langchain_astradb import AstraDBVectorStore
```

## Paramètres de connexion

Ceux-ci se trouvent sur le tableau de bord de votre Astra DB :

- le point de terminaison API ressemble à `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
- le jeton ressemble à `AstraCS:6gBhNmsk135....`
- vous pouvez éventuellement fournir un _Namespace_ comme `my_namespace`

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_namespace = input("(optional) Namespace = ")
if desired_namespace:
    ASTRA_DB_KEYSPACE = desired_namespace
else:
    ASTRA_DB_KEYSPACE = None
```

Vous pouvez maintenant créer le vector store :

```python
vstore = AstraDBVectorStore(
    embedding=embe,
    collection_name="astra_vector_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_KEYSPACE,
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

Dans ce qui précède, les dictionnaires `metadata` sont créés à partir des données sources et font partie du `Document`.

_Remarque : consultez la [documentation de l'API Astra DB](https://docs.datastax.com/en/astra-serverless/docs/develop/dev-with-json.html#_json_api_limits) pour connaître les noms de champs de métadonnées valides : certains caractères sont réservés et ne peuvent pas être utilisés._

Ajoutez quelques autres entrées, cette fois avec `add_texts` :

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_Remarque : vous voudrez peut-être accélérer l'exécution de `add_texts` et `add_documents` en augmentant le niveau de concurrence pour_
_ces opérations en bloc - consultez les paramètres `*_concurrency` dans le constructeur de la classe et les docstrings `add_texts`_
_pour plus de détails. Selon les spécifications du réseau et de la machine cliente, votre choix de paramètres le plus performant peut varier._

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

### Asynchrone

Notez que le vector store Astra DB prend en charge toutes les méthodes entièrement asynchrones (`asimilarity_search`, `afrom_texts`, `adelete` et ainsi de suite) de manière native, c'est-à-dire sans enveloppement de thread impliqué.

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

Les prochaines cellules mettront en œuvre un pipeline RAG simple :
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

Pour plus d'informations, consultez un modèle RAG complet utilisant Astra DB [ici](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb).

## Nettoyage

Si vous voulez supprimer complètement la collection de votre instance Astra DB, exécutez ceci.

_(Vous perdrez les données que vous y avez stockées.)_

```python
vstore.delete_collection()
```
