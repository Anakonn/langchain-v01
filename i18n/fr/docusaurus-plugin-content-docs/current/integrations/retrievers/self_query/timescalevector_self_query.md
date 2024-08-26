---
translated: true
---

# Timescale Vector (Postgres)

>[Timescale Vector](https://www.timescale.com/ai) est `PostgreSQL++` pour les applications d'IA. Il vous permet de stocker et d'interroger efficacement des milliards d'embeddings vectoriels dans `PostgreSQL`.
>
>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), également connu sous le nom de `Postgres`, est un système de gestion de base de données relationnelle (SGBDR) gratuit et open source, mettant l'accent sur l'extensibilité et la conformité `SQL`.

Ce notebook montre comment utiliser la base de données vectorielle Postgres (`TimescaleVector`) pour effectuer des auto-requêtes. Dans le notebook, nous démontrerons le `SelfQueryRetriever` enveloppé autour d'un magasin de vecteurs TimescaleVector.

## Qu'est-ce que Timescale Vector ?

**[Timescale Vector](https://www.timescale.com/ai) est PostgreSQL++ pour les applications d'IA.**

Timescale Vector vous permet de stocker et d'interroger efficacement des millions d'embeddings vectoriels dans `PostgreSQL`.
- Améliore `pgvector` avec une recherche de similarité plus rapide et plus précise sur 1 milliard+ de vecteurs via un algorithme d'indexation inspiré de DiskANN.
- Permet une recherche rapide de vecteurs basée sur le temps via le partitionnement et l'indexation automatiques basés sur le temps.
- Fournit une interface SQL familière pour interroger les embeddings vectoriels et les données relationnelles.

Timescale Vector est PostgreSQL cloud pour l'IA qui évolue avec vous de la POC à la production :
- Simplifie les opérations en vous permettant de stocker les métadonnées relationnelles, les embeddings vectoriels et les données de série temporelle dans une seule base de données.
- Bénéficie de la base solide de PostgreSQL avec des fonctionnalités d'entreprise comme les sauvegardes en continu et la réplication, la haute disponibilité et la sécurité au niveau des lignes.
- Offre une expérience sans souci avec une sécurité et une conformité de niveau entreprise.

## Comment accéder à Timescale Vector

Timescale Vector est disponible sur [Timescale](https://www.timescale.com/ai), la plateforme PostgreSQL cloud. (Il n'y a pas de version auto-hébergée pour le moment.)

Les utilisateurs de LangChain bénéficient d'un essai gratuit de 90 jours pour Timescale Vector.
- Pour commencer, [inscrivez-vous](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) à Timescale, créez une nouvelle base de données et suivez ce notebook !
- Consultez le [blog explicatif de Timescale Vector](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) pour plus de détails et de benchmarks de performance.
- Consultez les [instructions d'installation](https://github.com/timescale/python-vector) pour plus de détails sur l'utilisation de Timescale Vector en python.

## Création d'un magasin de vecteurs TimescaleVector

Tout d'abord, nous voulons créer un magasin de vecteurs Timescale Vector et le remplir avec quelques données. Nous avons créé un petit ensemble de documents de démonstration contenant des résumés de films.

REMARQUE : Le récupérateur d'auto-requête nécessite que vous ayez `lark` installé (`pip install lark`). Nous avons également besoin du package `timescale-vector`.

```python
%pip install --upgrade --quiet  lark
```

```python
%pip install --upgrade --quiet  timescale-vector
```

Dans cet exemple, nous utiliserons `OpenAIEmbeddings`, donc chargeons votre clé API OpenAI.

```python
# Get openAI api key by reading local .env file
# The .env file should contain a line starting with `OPENAI_API_KEY=sk-`
import os

from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Pour vous connecter à votre base de données PostgreSQL, vous aurez besoin de votre URI de service, que vous pouvez trouver dans le cheatsheet ou le fichier `.env` que vous avez téléchargé après avoir créé une nouvelle base de données.

Si vous ne l'avez pas encore fait, [inscrivez-vous à Timescale](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) et créez une nouvelle base de données.

L'URI ressemblera à quelque chose comme ceci : `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`

```python
# Get the service url by reading local .env file
# The .env file should contain a line starting with `TIMESCALE_SERVICE_URL=postgresql://`
_ = load_dotenv(find_dotenv())
TIMESCALE_SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# TIMESCALE_SERVICE_URL = getpass.getpass("Timescale Service URL:")
```

```python
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

Voici les documents d'exemple que nous utiliserons pour cette démonstration. Les données concernent des films et comportent à la fois des champs de contenu et de métadonnées avec des informations sur des films particuliers.

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
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
```

Enfin, nous créerons notre magasin de vecteurs Timescale Vector. Notez que le nom de la collection sera le nom de la table PostgreSQL dans laquelle les documents sont stockés.

```python
COLLECTION_NAME = "langchain_self_query_demo"
vectorstore = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=TIMESCALE_SERVICE_URL,
)
```

## Création de notre récupérateur d'auto-requête

Maintenant, nous pouvons instancier notre récupérateur. Pour ce faire, nous devrons fournir des informations préalables sur les champs de métadonnées pris en charge par nos documents et une brève description du contenu des documents.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
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

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Récupération d'auto-requête avec Timescale Vector

Et maintenant, nous pouvons essayer d'utiliser réellement notre récupérateur !

Exécutez les requêtes ci-dessous et notez comment vous pouvez spécifier une requête, un filtre, un filtre composite (filtres avec AND, OR) en langage naturel, et le récupérateur d'auto-requête les traduira en SQL et effectuera la recherche sur le magasin de vecteurs Timescale Vector (Postgres).

Cela illustre la puissance du récupérateur d'auto-requête. Vous pouvez l'utiliser pour effectuer des recherches complexes sur votre magasin de vecteurs sans avoir à écrire de SQL directement, ni vous ni vos utilisateurs !

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

### Filtre k

Nous pouvons également utiliser le récupérateur d'auto-requête pour spécifier `k` : le nombre de documents à récupérer.

Nous pouvons le faire en passant `enable_limit=True` au constructeur.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example specifies a query with a LIMIT value
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7})]
```
