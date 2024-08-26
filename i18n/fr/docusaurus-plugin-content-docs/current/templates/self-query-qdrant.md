---
translated: true
---

# self-query-qdrant

Ce modèle effectue [self-querying](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query/) en utilisant Qdrant et OpenAI. Par défaut, il utilise un jeu de données artificielles de 10 documents, mais vous pouvez le remplacer par votre propre jeu de données.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Définissez `QDRANT_URL` sur l'URL de votre instance Qdrant. Si vous utilisez [Qdrant Cloud](https://cloud.qdrant.io), vous devez également définir la variable d'environnement `QDRANT_API_KEY`. Si vous ne définissez aucun de ces paramètres, le modèle essaiera de se connecter à une instance Qdrant locale à `http://localhost:6333`.

```shell
export QDRANT_URL=
export QDRANT_API_KEY=

export OPENAI_API_KEY=
```

## Utilisation

Pour utiliser ce package, installez d'abord l'interface en ligne de commande LangChain :

```shell
pip install -U "langchain-cli[serve]"
```

Créez un nouveau projet LangChain et installez ce package comme seul dépendance :

```shell
langchain app new my-app --package self-query-qdrant
```

Pour l'ajouter à un projet existant, exécutez :

```shell
langchain app add self-query-qdrant
```

### Paramètres par défaut

Avant de lancer le serveur, vous devez créer une collection Qdrant et indexer les documents.
Cela peut être fait en exécutant la commande suivante :

```python
from self_query_qdrant.chain import initialize

initialize()
```

Ajoutez le code suivant à votre fichier `app/server.py` :

```python
from self_query_qdrant.chain import chain

add_routes(app, chain, path="/self-query-qdrant")
```

Le jeu de données par défaut se compose de 10 documents sur des plats, avec leur prix et des informations sur les restaurants.
Vous pouvez trouver les documents dans le fichier `packages/self-query-qdrant/self_query_qdrant/defaults.py`.
Voici l'un des documents :

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document

Document(
    page_content="Spaghetti with meatballs and tomato sauce",
    metadata={
        "price": 12.99,
        "restaurant": {
            "name": "Olive Garden",
            "location": ["New York", "Chicago", "Los Angeles"],
        },
    },
)
```

Le self-querying permet d'effectuer une recherche sémantique sur les documents, avec un filtrage supplémentaire
basé sur les métadonnées. Par exemple, vous pouvez rechercher les plats qui coûtent moins de 15 $ et sont servis à New York.

### Personnalisation

Tous les exemples ci-dessus supposent que vous voulez lancer le modèle avec les paramètres par défaut.
Si vous voulez personnaliser le modèle, vous pouvez le faire en passant les paramètres à la fonction `create_chain`
dans le fichier `app/server.py` :

```python
<!--IMPORTS:[{"imported": "Cohere", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}, {"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.schema", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "self-query-qdrant"}]-->
from langchain_community.llms import Cohere
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains.query_constructor.schema import AttributeInfo

from self_query_qdrant.chain import create_chain

chain = create_chain(
    llm=Cohere(),
    embeddings=HuggingFaceEmbeddings(),
    document_contents="Descriptions of cats, along with their names and breeds.",
    metadata_field_info=[
        AttributeInfo(name="name", description="Name of the cat", type="string"),
        AttributeInfo(name="breed", description="Cat's breed", type="string"),
    ],
    collection_name="cats",
)
```

Il en va de même pour la fonction `initialize` qui crée une collection Qdrant et indexe les documents :

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

from self_query_qdrant.chain import initialize

initialize(
    embeddings=HuggingFaceEmbeddings(),
    collection_name="cats",
    documents=[
        Document(
            page_content="A mean lazy old cat who destroys furniture and eats lasagna",
            metadata={"name": "Garfield", "breed": "Tabby"},
        ),
        ...
    ]
)
```

Le modèle est flexible et peut être facilement utilisé pour différents ensembles de documents.

### LangSmith

(Facultatif) Si vous avez accès à LangSmith, configurez-le pour aider à tracer, surveiller et déboguer les applications LangChain. Si vous n'avez pas accès, ignorez cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez démarrer une instance LangServe directement en :

```shell
langchain serve
```

### Serveur local

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur
[http://localhost:8000](http://localhost:8000)

Vous pouvez voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Accédez au playground sur [http://127.0.0.1:8000/self-query-qdrant/playground](http://127.0.0.1:8000/self-query-qdrant/playground)

Accédez au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-qdrant")
```
