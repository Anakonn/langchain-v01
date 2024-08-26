---
translated: true
---

# Epsilla

>[Epsilla](https://www.epsilla.com) est une base de données vectorielle open-source qui exploite les techniques avancées de parcours de graphe parallèle pour l'indexation vectorielle. Epsilla est sous licence GPL-3.0.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `Epsilla`.

Comme prérequis, vous devez avoir une base de données vectorielle Epsilla en cours d'exécution (par exemple, via notre image docker) et installer le package ``pyepsilla``. Voir la documentation complète sur [docs](https://epsilla-inc.gitbook.io/epsilladb/quick-start).

```python
!pip/pip3 install pyepsilla
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Clé API OpenAI : ········

```python
from langchain_community.vectorstores import Epsilla
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0).split_documents(
    documents
)

embeddings = OpenAIEmbeddings()
```

La base de données vectorielle Epsilla fonctionne avec l'hôte par défaut "localhost" et le port "8888". Nous avons un chemin de base de données personnalisé, un nom de base de données et un nom de collection différents des valeurs par défaut.

```python
from pyepsilla import vectordb

client = vectordb.Client()
vector_store = Epsilla.from_documents(
    documents,
    embeddings,
    client,
    db_path="/tmp/mypath",
    db_name="MyDB",
    collection_name="MyCollection",
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

Dans État après État, de nouvelles lois ont été adoptées, non seulement pour réprimer le vote, mais aussi pour subvertir des élections entières.

Nous ne pouvons pas laisser cela se produire.

Ce soir, je demande au Sénat de : Adopter la loi sur la liberté de vote. Adopter la loi sur les droits de vote de John Lewis. Et pendant que vous y êtes, adoptez la loi sur la divulgation afin que les Américains puissent savoir qui finance nos élections.

Ce soir, j'aimerais honorer quelqu'un qui a consacré sa vie à servir ce pays : le juge Stephen Breyer - un vétéran de l'armée, un spécialiste du droit constitutionnel et un juge sortant de la Cour suprême des États-Unis. Juge Breyer, merci pour votre service.

L'une des responsabilités constitutionnelles les plus sérieuses d'un président est de nommer quelqu'un pour siéger à la Cour suprême des États-Unis.

Et c'est ce que j'ai fait il y a 4 jours, en nommant la juge d'appel de circuit Ketanji Brown Jackson. L'un des meilleurs esprits juridiques de notre nation, qui poursuivra l'héritage d'excellence du juge Breyer.
