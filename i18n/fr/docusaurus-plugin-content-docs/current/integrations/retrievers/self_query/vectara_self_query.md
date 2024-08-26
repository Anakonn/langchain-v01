---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) est la plateforme GenAI de confiance qui fournit une API facile à utiliser pour l'indexation et l'interrogation de documents.
>
>`Vectara` fournit un service géré de bout en bout pour `Retrieval Augmented Generation` ou [RAG](https://vectara.com/grounded-generation/), qui comprend :
>1. Un moyen d'`extraire le texte` des fichiers de documents et de les `découper` en phrases.
>2. Le modèle d'embeddings [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) à la pointe de la technologie. Chaque fragment de texte est encodé dans un embedding vectoriel à l'aide de `Boomerang`, et stocké dans le magasin de connaissances interne de Vectara (vecteur+texte).
>3. Un service de requête qui encode automatiquement la requête en embedding et récupère les segments de texte les plus pertinents (y compris la prise en charge de la [recherche hybride](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) et de la [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))).
>4. Une option pour créer un [résumé génératif](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview), basé sur les documents récupérés, y compris les citations.

Consultez la [documentation de l'API Vectara](https://docs.vectara.com/docs/) pour plus d'informations sur la façon d'utiliser l'API.

Ce notebook montre comment utiliser `SelfQueryRetriever` avec Vectara.

# Configuration

Vous aurez besoin d'un compte `Vectara` pour utiliser `Vectara` avec `LangChain`. Pour commencer, suivez les étapes suivantes (voir notre [guide de démarrage rapide](https://docs.vectara.com/docs/quickstart)) :
1. [Inscrivez-vous](https://console.vectara.com/signup) à un compte `Vectara` si vous n'en avez pas déjà un. Une fois votre inscription terminée, vous aurez un identifiant client Vectara. Vous pouvez trouver votre identifiant client en cliquant sur votre nom, en haut à droite de la fenêtre de la console Vectara.
2. Dans votre compte, vous pouvez créer un ou plusieurs corpus. Chaque corpus représente un domaine qui stocke les données textuelles lors de l'ingestion à partir de documents d'entrée. Pour créer un corpus, utilisez le bouton **"Créer un corpus"**. Vous fournissez ensuite un nom à votre corpus ainsi qu'une description. Vous pouvez éventuellement définir des attributs de filtrage et appliquer quelques options avancées. Si vous cliquez sur votre corpus créé, vous pouvez voir son nom et son identifiant de corpus en haut.
3. Vous aurez ensuite besoin de créer des clés API pour accéder au corpus. Cliquez sur l'onglet **"Autorisation"** dans la vue du corpus, puis sur le bouton **"Créer une clé API"**. Donnez un nom à votre clé et choisissez si vous voulez une clé pour la requête uniquement ou pour la requête+l'indexation. Cliquez sur "Créer" et vous avez maintenant une clé API active. Gardez cette clé confidentielle.

Pour utiliser LangChain avec Vectara, vous avez besoin de trois valeurs : l'identifiant client, l'identifiant de corpus et la clé api.
Vous pouvez les fournir à LangChain de deux manières :

1. Incluez dans votre environnement ces trois variables : `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` et `VECTARA_API_KEY`.

> Par exemple, vous pouvez définir ces variables à l'aide de `os.environ` et `getpass` comme suit :

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

1. Fournissez-les en tant qu'arguments lors de la création de l'objet `Vectara` vectorstore :

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

**Remarque :** Le récupérateur de requête automatique nécessite que vous ayez `lark` installé (`pip install lark`).

## Connexion à Vectara depuis LangChain

Dans cet exemple, nous supposons que vous avez créé un compte et un corpus, et que vous avez ajouté vos VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID et VECTARA_API_KEY (créés avec des autorisations pour l'indexation et la requête) en tant que variables d'environnement.

Le corpus a 4 champs définis en tant que métadonnées pour le filtrage : année, réalisateur, note et genre.

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.documents import Document
from langchain_openai import OpenAI
from langchain_text_splitters import CharacterTextSplitter
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]

vectara = Vectara()
for doc in docs:
    vectara.add_texts(
        [doc.page_content],
        embedding=FakeEmbeddings(size=768),
        doc_metadata=doc.metadata,
    )
```

## Création de notre récupérateur de requête automatique

Maintenant, nous pouvons instancier notre récupérateur. Pour ce faire, nous devrons fournir des informations préalables sur les champs de métadonnées pris en charge par nos documents et une brève description du contenu des documents.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectara, document_content_description, metadata_field_info, verbose=True
)
```

## Essayons-le

Et maintenant, nous pouvons essayer d'utiliser réellement notre récupérateur !

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'lang': 'eng', 'offset': '0', 'len': '76', 'year': '2010', 'director': 'Christopher Nolan', 'rating': '8.2', 'source': 'langchain'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```

## Filtrer k

Nous pouvons également utiliser le récupérateur de requête automatique pour spécifier `k` : le nombre de documents à récupérer.

Nous pouvons le faire en passant `enable_limit=True` au constructeur.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectara,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```
