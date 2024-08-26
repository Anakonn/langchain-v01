---
translated: true
---

# Typesense

> [Typesense](https://typesense.org) est un moteur de recherche open-source en mémoire vive, que vous pouvez soit [héberger vous-même](https://typesense.org/docs/guide/install-typesense#option-2-local-machine-self-hosting) soit exécuter sur [Typesense Cloud](https://cloud.typesense.org/).
>
> Typesense se concentre sur les performances en stockant l'intégralité de l'index en RAM (avec une sauvegarde sur disque) et se concentre également sur la fourniture d'une expérience de développeur prête à l'emploi en simplifiant les options disponibles et en définissant de bonnes valeurs par défaut.
>
> Il vous permet également de combiner le filtrage basé sur les attributs avec les requêtes vectorielles, pour récupérer les documents les plus pertinents.

Ce notebook vous montre comment utiliser Typesense comme votre VectorStore.

Commençons par installer nos dépendances :

```python
%pip install --upgrade --quiet  typesense openapi-schema-pydantic langchain-openai tiktoken
```

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Typesense
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Importons notre jeu de données de test :

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
docsearch = Typesense.from_documents(
    docs,
    embeddings,
    typesense_client_params={
        "host": "localhost",  # Use xxx.a1.typesense.net for Typesense Cloud
        "port": "8108",  # Use 443 for Typesense Cloud
        "protocol": "http",  # Use https for Typesense Cloud
        "typesense_api_key": "xyz",
        "typesense_collection_name": "lang-chain",
    },
)
```

## Recherche de similarité

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = docsearch.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

## Typesense en tant que Retriever

Typesense, comme tous les autres magasins de vecteurs, est un LangChain Retriever, en utilisant la similarité cosinus.

```python
retriever = docsearch.as_retriever()
retriever
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```
