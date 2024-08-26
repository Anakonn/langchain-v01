---
translated: true
---

# Tigris

> [Tigris](https://tigrisdata.com) est une base de données NoSQL et une plateforme de recherche vectorielle open-source conçue pour simplifier la construction d'applications de recherche vectorielle haute performance.
> `Tigris` élimine la complexité de l'infrastructure de gestion, d'exploitation et de synchronisation de plusieurs outils, vous permettant de vous concentrer sur la construction de grandes applications.

Ce notebook vous guide sur l'utilisation de Tigris en tant que votre VectorStore

**Prérequis**
1. Un compte OpenAI. Vous pouvez vous inscrire [ici](https://platform.openai.com/)
2. [Inscrivez-vous gratuitement à un compte Tigris](https://console.preview.tigrisdata.cloud). Une fois que vous vous êtes inscrit au compte Tigris, créez un nouveau projet appelé `vectordemo`. Ensuite, notez l'*Uri* de la région dans laquelle vous avez créé votre projet, le **clientId** et le **clientSecret**. Vous pouvez obtenir toutes ces informations dans la section **Clés d'application** du projet.

Commençons par installer nos dépendances :

```python
%pip install --upgrade --quiet  tigrisdb openapi-schema-pydantic langchain-openai tiktoken
```

Nous allons charger la clé API `OpenAI` et les identifiants `Tigris` dans notre environnement

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["TIGRIS_PROJECT"] = getpass.getpass("Tigris Project Name:")
os.environ["TIGRIS_CLIENT_ID"] = getpass.getpass("Tigris Client Id:")
os.environ["TIGRIS_CLIENT_SECRET"] = getpass.getpass("Tigris Client Secret:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Tigris
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Initialiser le magasin vectoriel Tigris

Importons notre jeu de données de test :

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_store = Tigris.from_documents(docs, embeddings, index_name="my_embeddings")
```

### Recherche de similarité

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### Recherche de similarité avec score (distance vectorielle)

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
