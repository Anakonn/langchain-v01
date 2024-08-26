---
sidebar_position: 0
translated: true
---

# Démarrage rapide

Cette page montrera comment utiliser l'analyse des requêtes dans un exemple de bout en bout de base. Cela couvrira la création d'un moteur de recherche simple, la présentation d'un mode de défaillance qui se produit lors du passage d'une question brute d'utilisateur à cette recherche, puis un exemple de la façon dont l'analyse des requêtes peut aider à résoudre ce problème. Il existe de NOMBREUSES techniques d'analyse des requêtes différentes et cet exemple de bout en bout n'en montrera pas toutes.

Pour les besoins de cet exemple, nous effectuerons une récupération sur les vidéos YouTube de LangChain.

## Configuration

#### Installer les dépendances

```python
# %pip install -qU langchain langchain-community langchain-openai youtube-transcript-api pytube langchain-chroma
```

#### Définir les variables d'environnement

Nous utiliserons OpenAI dans cet exemple :

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Charger les documents

Nous pouvons utiliser le `YouTubeLoader` pour charger les transcriptions de quelques vidéos LangChain :

```python
from langchain_community.document_loaders import YoutubeLoader

urls = [
    "https://www.youtube.com/watch?v=HAn9vnJy6S4",
    "https://www.youtube.com/watch?v=dA1cHGACXCo",
    "https://www.youtube.com/watch?v=ZcEMLz27sL4",
    "https://www.youtube.com/watch?v=hvAPnpSfSGo",
    "https://www.youtube.com/watch?v=EhlPDL4QrWY",
    "https://www.youtube.com/watch?v=mmBo8nlu2j0",
    "https://www.youtube.com/watch?v=rQdibOsL1ps",
    "https://www.youtube.com/watch?v=28lC4fqukoc",
    "https://www.youtube.com/watch?v=es-9MgxB-uc",
    "https://www.youtube.com/watch?v=wLRHwKuKvOE",
    "https://www.youtube.com/watch?v=ObIltMaRJvY",
    "https://www.youtube.com/watch?v=DjuXACWYkkU",
    "https://www.youtube.com/watch?v=o7C9ld6Ln-M",
]
docs = []
for url in urls:
    docs.extend(YoutubeLoader.from_youtube_url(url, add_video_info=True).load())
```

```python
import datetime

# Add some additional metadata: what year the video was published
for doc in docs:
    doc.metadata["publish_year"] = int(
        datetime.datetime.strptime(
            doc.metadata["publish_date"], "%Y-%m-%d %H:%M:%S"
        ).strftime("%Y")
    )
```

Voici les titres des vidéos que nous avons chargées :

```python
[doc.metadata["title"] for doc in docs]
```

```output
['OpenGPTs',
 'Building a web RAG chatbot: using LangChain, Exa (prev. Metaphor), LangSmith, and Hosted Langserve',
 'Streaming Events: Introducing a new `stream_events` method',
 'LangGraph: Multi-Agent Workflows',
 'Build and Deploy a RAG app with Pinecone Serverless',
 'Auto-Prompt Builder (with Hosted LangServe)',
 'Build a Full Stack RAG App With TypeScript',
 'Getting Started with Multi-Modal LLMs',
 'SQL Research Assistant',
 'Skeleton-of-Thought: Building a New Template from Scratch',
 'Benchmarking RAG over LangChain Docs',
 'Building a Research Assistant from Scratch',
 'LangServe and LangChain Templates Webinar']
```

Voici les métadonnées associées à chaque vidéo. Nous pouvons voir que chaque document a également un titre, un nombre de vues, une date de publication et une durée :

```python
docs[0].metadata
```

```output
{'source': 'HAn9vnJy6S4',
 'title': 'OpenGPTs',
 'description': 'Unknown',
 'view_count': 7210,
 'thumbnail_url': 'https://i.ytimg.com/vi/HAn9vnJy6S4/hq720.jpg',
 'publish_date': '2024-01-31 00:00:00',
 'length': 1530,
 'author': 'LangChain',
 'publish_year': 2024}
```

Et voici un extrait du contenu d'un document :

```python
docs[0].page_content[:500]
```

```output
"hello today I want to talk about open gpts open gpts is a project that we built here at linkchain uh that replicates the GPT store in a few ways so it creates uh end user-facing friendly interface to create different Bots and these Bots can have access to different tools and they can uh be given files to retrieve things over and basically it's a way to create a variety of bots and expose the configuration of these Bots to end users it's all open source um it can be used with open AI it can be us"
```

### Indexation des documents

Chaque fois que nous effectuons une récupération, nous devons créer un index des documents que nous pouvons interroger. Nous utiliserons un magasin de vecteurs pour indexer nos documents et nous les découperons d'abord pour rendre nos récupérations plus concises et précises :

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
chunked_docs = text_splitter.split_documents(docs)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    chunked_docs,
    embeddings,
)
```

## Récupération sans analyse des requêtes

Nous pouvons effectuer une recherche de similarité directement sur une question d'utilisateur pour trouver les fragments pertinents à la question :

```python
search_results = vectorstore.similarity_search("how do I build a RAG agent")
print(search_results[0].metadata["title"])
print(search_results[0].page_content[:500])
```

```output
Build and Deploy a RAG app with Pinecone Serverless
hi this is Lance from the Lang chain team and today we're going to be building and deploying a rag app using pine con serval list from scratch so we're going to kind of walk through all the code required to do this and I'll use these slides as kind of a guide to kind of lay the the ground work um so first what is rag so under capoy has this pretty nice visualization that shows LMS as a kernel of a new kind of operating system and of course one of the core components of our operating system is th
```

Cela fonctionne assez bien ! Notre premier résultat est assez pertinent pour la question.

Et si nous voulions rechercher des résultats d'une période spécifique ?

```python
search_results = vectorstore.similarity_search("videos on RAG published in 2023")
print(search_results[0].metadata["title"])
print(search_results[0].metadata["publish_date"])
print(search_results[0].page_content[:500])
```

```output
OpenGPTs
2024-01-31
hardcoded that it will always do a retrieval step here the assistant decides whether to do a retrieval step or not sometimes this is good sometimes this is bad sometimes it you don't need to do a retrieval step when I said hi it didn't need to call it tool um but other times you know the the llm might mess up and not realize that it needs to do a retrieval step and so the rag bot will always do a retrieval step so it's more focused there because this is also a simpler architecture so it's always
```

Notre premier résultat est de 2024 (malgré le fait que nous ayons demandé des vidéos de 2023) et n'est pas très pertinent pour l'entrée. Comme nous recherchons uniquement dans le contenu des documents, il n'y a aucun moyen de filtrer les résultats sur les attributs des documents.

Il s'agit d'un seul mode de défaillance qui peut survenir. Examinons maintenant comment une forme de base d'analyse des requêtes peut le corriger !

## Analyse des requêtes

Nous pouvons utiliser l'analyse des requêtes pour améliorer les résultats de la récupération. Cela impliquera de définir un **schéma de requête** contenant des filtres de date et d'utiliser un modèle d'appel de fonction pour convertir une question d'utilisateur en requêtes structurées.

### Schéma de requête

Dans ce cas, nous aurons des attributs min et max explicites pour la date de publication afin qu'elle puisse être filtrée.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

### Génération de requêtes

Pour convertir les questions des utilisateurs en requêtes structurées, nous utiliserons l'API d'appel d'outils d'OpenAI. Plus précisément, nous utiliserons le nouvel [ChatModel.with_structured_output()](/docs/modules/model_io/chat/structured_output) constructeur pour gérer le passage du schéma au modèle et l'analyse de la sortie.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

Voyons quelles requêtes notre analyseur génère pour les questions que nous avons recherchées précédemment :

```python
query_analyzer.invoke("how do I build a RAG agent")
```

```output
Search(query='build RAG agent', publish_year=None)
```

```python
query_analyzer.invoke("videos on RAG published in 2023")
```

```output
Search(query='RAG', publish_year=2023)
```

## Récupération avec analyse des requêtes

Notre analyse des requêtes semble assez bonne ; maintenant, essayons d'utiliser nos requêtes générées pour effectuer réellement la récupération.

**Remarque :** dans notre exemple, nous avons spécifié `tool_choice="Search"`. Cela forcera le LLM à appeler un - et un seul - outil, ce qui signifie que nous aurons toujours une requête optimisée à rechercher. Notez que ce n'est pas toujours le cas - consultez d'autres guides pour savoir comment gérer les situations où aucune - ou plusieurs - requêtes optimisées ne sont renvoyées.

```python
from typing import List

from langchain_core.documents import Document
```

```python
def retrieval(search: Search) -> List[Document]:
    if search.publish_year is not None:
        # This is syntax specific to Chroma,
        # the vector database we are using.
        _filter = {"publish_year": {"$eq": search.publish_year}}
    else:
        _filter = None
    return vectorstore.similarity_search(search.query, filter=_filter)
```

```python
retrieval_chain = query_analyzer | retrieval
```

Nous pouvons maintenant exécuter cette chaîne sur l'entrée problématique d'avant et constater qu'elle ne renvoie que des résultats de cette année !

```python
results = retrieval_chain.invoke("RAG tutorial published in 2023")
```

```python
[(doc.metadata["title"], doc.metadata["publish_date"]) for doc in results]
```

```output
[('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('LangServe and LangChain Templates Webinar', '2023-11-02 00:00:00'),
 ('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('Building a Research Assistant from Scratch', '2023-11-16 00:00:00')]
```
