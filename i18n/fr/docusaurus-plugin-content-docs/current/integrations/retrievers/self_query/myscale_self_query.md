---
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/) est une base de données vectorielle intégrée. Vous pouvez accéder à votre base de données en SQL et également à partir d'ici, LangChain.
>`MyScale` peut utiliser [différents types de données et fonctions pour les filtres](https://blog.myscale.com/2023/06/06/why-integrated-database-solution-can-boost-your-llm-apps/#filter-on-anything-without-constraints). Il boostera votre application LLM, que vous augmentiez vos données ou que vous développiez votre système pour des applications plus larges.

Dans le notebook, nous démontrerons le `SelfQueryRetriever` enveloppé autour d'un magasin de vecteurs `MyScale` avec quelques éléments supplémentaires que nous avons contribués à LangChain.

En résumé, cela peut être condensé en 4 points :
1. Ajouter le comparateur `contain` pour correspondre à la liste de n'importe quel élément s'il y en a plus d'un qui correspond
2. Ajouter le type de données `timestamp` pour la correspondance de date et heure (format ISO ou AAAA-MM-JJ)
3. Ajouter le comparateur `like` pour la recherche de motifs de chaîne
4. Ajouter la capacité de fonction arbitraire

## Création d'un magasin de vecteurs MyScale

MyScale a déjà été intégré à LangChain depuis un certain temps. Vous pouvez donc suivre [ce notebook](/docs/integrations/vectorstores/myscale) pour créer votre propre magasin de vecteurs pour un récupérateur de requête automatique.

**Remarque :** Tous les récupérateurs de requête automatique nécessitent que vous ayez `lark` installé (`pip install lark`). Nous utilisons `lark` pour la définition de la grammaire. Avant de passer à l'étape suivante, nous voulons également vous rappeler que `clickhouse-connect` est également nécessaire pour interagir avec votre backend MyScale.

```python
%pip install --upgrade --quiet  lark clickhouse-connect
```

Dans ce tutoriel, nous suivons le paramétrage d'autres exemples et utilisons `OpenAIEmbeddings`. N'oubliez pas d'obtenir une clé API OpenAI pour un accès valide aux LLM.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale URL:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

```python
from langchain_community.vectorstores import MyScale
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

## Créer quelques données d'exemple

Comme vous pouvez le voir, les données que nous avons créées présentent quelques différences par rapport à d'autres récupérateurs de requête automatique. Nous avons remplacé le mot-clé `year` par `date` ce qui vous donne un contrôle plus fin sur les horodatages. Nous avons également changé le type du mot-clé `gerne` en une liste de chaînes, où un LLM peut utiliser un nouveau comparateur `contain` pour construire des filtres. Nous fournissons également le comparateur `like` et la prise en charge des fonctions arbitraires pour les filtres, qui seront présentés dans les prochaines cellules.

Maintenant, examinons les données.

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"date": "1993-07-02", "rating": 7.7, "genre": ["science fiction"]},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"date": "2010-12-30", "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"date": "2006-04-23", "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"date": "2019-08-22", "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"date": "1995-02-11", "genre": ["animated"]},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "date": "1979-09-10",
            "director": "Andrei Tarkovsky",
            "genre": ["science fiction", "adventure"],
            "rating": 9.9,
        },
    ),
]
vectorstore = MyScale.from_documents(
    docs,
    embeddings,
)
```

## Création de notre récupérateur de requête automatique

Tout comme les autres récupérateurs... simple et agréable.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genres of the movie",
        type="list[string]",
    ),
    # If you want to include length of a list, just define it as a new column
    # This will teach the LLM to use it as a column when constructing filter.
    AttributeInfo(
        name="length(genre)",
        description="The length of genres of the movie",
        type="integer",
    ),
    # Now you can define a column as timestamp. By simply set the type to timestamp.
    AttributeInfo(
        name="date",
        description="The date the movie was released",
        type="timestamp",
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
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Test avec les fonctionnalités existantes du récupérateur de requête automatique

Et maintenant, nous pouvons essayer d'utiliser réellement notre récupérateur !

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

# Attendez une seconde... quoi d'autre ?

Le récupérateur de requête automatique avec MyScale peut faire plus ! Découvrons-le.

```python
# You can use length(genres) to do anything you want
retriever.invoke("What's a movie that have more than 1 genres?")
```

```python
# Fine-grained datetime? You got it already.
retriever.invoke("What's a movie that release after feb 1995?")
```

```python
# Don't know what your exact filter should be? Use string pattern match!
retriever.invoke("What's a movie whose name is like Andrei?")
```

```python
# Contain works for lists: so you can match a list with contain comparator!
retriever.invoke("What's a movie who has genres science fiction and adventure?")
```

## Filtrer k

Nous pouvons également utiliser le récupérateur de requête automatique pour spécifier `k` : le nombre de documents à récupérer.

Nous pouvons faire cela en passant `enable_limit=True` au constructeur.

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
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```
