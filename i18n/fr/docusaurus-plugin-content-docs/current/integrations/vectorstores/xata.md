---
translated: true
---

# Xata

> [Xata](https://xata.io) est une plateforme de données sans serveur, basée sur PostgreSQL. Elle fournit un SDK Python pour interagir avec votre base de données et une interface utilisateur pour gérer vos données.
> Xata a un type de vecteur natif, qui peut être ajouté à n'importe quelle table, et prend en charge la recherche de similarité. LangChain insère des vecteurs directement dans Xata et les interroge pour trouver les plus proches voisins d'un vecteur donné, afin que vous puissiez utiliser toutes les intégrations d'embeddings LangChain avec Xata.

Ce notebook vous guide sur l'utilisation de Xata en tant que VectorStore.

## Configuration

### Créer une base de données à utiliser comme magasin de vecteurs

Dans l'[interface utilisateur Xata](https://app.xata.io), créez une nouvelle base de données. Vous pouvez lui donner le nom que vous voulez, dans ce bloc-notes nous utiliserons `langchain`.
Créez une table, là encore vous pouvez la nommer comme vous le souhaitez, mais nous utiliserons `vectors`. Ajoutez les colonnes suivantes via l'interface utilisateur :

* `content` de type "Texte". Cela sert à stocker les valeurs `Document.pageContent`.
* `embedding` de type "Vecteur". Utilisez la dimension utilisée par le modèle que vous prévoyez d'utiliser. Dans ce notebook, nous utilisons les embeddings OpenAI, qui ont 1536 dimensions.
* `source` de type "Texte". Cela sert de colonne de métadonnées pour cet exemple.
* toute autre colonne que vous souhaitez utiliser comme métadonnées. Elles sont remplies à partir de l'objet `Document.metadata`. Par exemple, si dans l'objet `Document.metadata` vous avez une propriété `title`, vous pouvez créer une colonne `title` dans la table et elle sera remplie.

Commençons par installer nos dépendances :

```python
%pip install --upgrade --quiet  xata langchain-openai tiktoken langchain
```

Chargeons la clé OpenAI dans l'environnement. Si vous n'en avez pas, vous pouvez créer un compte OpenAI et créer une clé sur cette [page](https://platform.openai.com/account/api-keys).

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

De même, nous avons besoin des variables d'environnement pour Xata. Vous pouvez créer une nouvelle clé API en visitant vos [paramètres de compte](https://app.xata.io/settings). Pour trouver l'URL de la base de données, allez sur la page des paramètres de la base de données que vous avez créée. L'URL de la base de données devrait ressembler à ceci : `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`.

```python
api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Créer le magasin de vecteurs Xata

Importons notre jeu de données de test :

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Créons maintenant le magasin de vecteurs réel, avec la table Xata en back-end.

```python
vector_store = XataVectorStore.from_documents(
    docs, embeddings, api_key=api_key, db_url=db_url, table_name="vectors"
)
```

Après avoir exécuté la commande ci-dessus, si vous allez dans l'interface utilisateur Xata, vous devriez voir les documents chargés avec leurs embeddings.
Pour utiliser une table Xata existante qui contient déjà des contenus vectoriels, initialisez le constructeur XataVectorStore :

```python
vector_store = XataVectorStore(
    api_key=api_key, db_url=db_url, embedding=embeddings, table_name="vectors"
)
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
