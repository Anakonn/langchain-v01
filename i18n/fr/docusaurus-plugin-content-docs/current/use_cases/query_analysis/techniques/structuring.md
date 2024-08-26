---
sidebar_position: 3
translated: true
---

# Structuration

Une des étapes les plus importantes de la récupération est de transformer une entrée de texte en bons paramètres de recherche et de filtrage. Ce processus d'extraction de paramètres structurés à partir d'une entrée non structurée est ce que nous appelons la **structuration de requête**.

Pour illustrer, revenons à notre exemple de chatbot de questions-réponses sur les vidéos YouTube de LangChain à partir du [Démarrage rapide](/docs/use_cases/query_analysis/quickstart) et voyons à quoi pourraient ressembler des requêtes structurées plus complexes dans ce cas.

## Configuration

#### Installer les dépendances

```python
# %pip install -qU langchain langchain-openai youtube-transcript-api pytube
```

#### Définir les variables d'environnement

Nous utiliserons OpenAI dans cet exemple :

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Charger un document exemple

Chargeons un document représentatif

```python
from langchain_community.document_loaders import YoutubeLoader

docs = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=pbAd8O1Lvm4", add_video_info=True
).load()
```

Voici les métadonnées associées à une vidéo :

```python
docs[0].metadata
```

```output
{'source': 'pbAd8O1Lvm4',
 'title': 'Self-reflective RAG with LangGraph: Self-RAG and CRAG',
 'description': 'Unknown',
 'view_count': 9006,
 'thumbnail_url': 'https://i.ytimg.com/vi/pbAd8O1Lvm4/hq720.jpg',
 'publish_date': '2024-02-07 00:00:00',
 'length': 1058,
 'author': 'LangChain'}
```

Et voici un extrait du contenu du document :

```python
docs[0].page_content[:500]
```

```output
"hi this is Lance from Lang chain I'm going to be talking about using Lang graph to build a diverse and sophisticated rag flows so just to set the stage the basic rag flow you can see here starts with a question retrieval of relevant documents from an index which are passed into the context window of an llm for generation of an answer grounded in the ret documents so that's kind of the basic outline and we can see it's like a very linear path um in practice though you often encounter a few differ"
```

## Schéma de requête

Afin de générer des requêtes structurées, nous devons d'abord définir notre schéma de requête. Nous pouvons voir que chaque document a un titre, un nombre de vues, une date de publication et une durée en secondes. Supposons que nous ayons construit un index qui nous permet d'effectuer une recherche non structurée sur le contenu et le titre de chaque document, et d'utiliser un filtrage par plage sur le nombre de vues, la date de publication et la durée.

Pour commencer, nous créerons un schéma avec des attributs min et max explicites pour le nombre de vues, la date de publication et la durée de la vidéo afin de pouvoir les filtrer. Et nous ajouterons des attributs séparés pour les recherches sur le contenu de la transcription par rapport au titre de la vidéo.

Nous pourrions également créer un schéma plus générique où, au lieu d'avoir un ou plusieurs attributs de filtre pour chaque champ filtrable, nous avons un seul attribut `filters` qui prend une liste de tuples (attribut, condition, valeur). Nous démontrerons également comment faire cela. L'approche la plus appropriée dépend de la complexité de votre index. Si vous avez de nombreux champs filtrables, il peut être préférable d'avoir un seul attribut de requête `filters`. Si vous n'avez que quelques champs filtrables et/ou s'il y a des champs qui ne peuvent être filtrés que de manière très spécifique, il peut être utile d'avoir des attributs de requête séparés pour eux, chacun avec sa propre description.

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    min_view_count: Optional[int] = Field(
        None,
        description="Minimum view count filter, inclusive. Only use if explicitly specified.",
    )
    max_view_count: Optional[int] = Field(
        None,
        description="Maximum view count filter, exclusive. Only use if explicitly specified.",
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None,
        description="Earliest publish date filter, inclusive. Only use if explicitly specified.",
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None,
        description="Latest publish date filter, exclusive. Only use if explicitly specified.",
    )
    min_length_sec: Optional[int] = Field(
        None,
        description="Minimum video length in seconds, inclusive. Only use if explicitly specified.",
    )
    max_length_sec: Optional[int] = Field(
        None,
        description="Maximum video length in seconds, exclusive. Only use if explicitly specified.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

## Génération de requêtes

Pour convertir les questions des utilisateurs en requêtes structurées, nous utiliserons un modèle d'appel de fonction, comme ChatOpenAI. LangChain a des constructeurs pratiques qui facilitent la spécification d'un schéma d'appel de fonction souhaité via une classe Pydantic :

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a database query optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

Essayons-le :

```python
query_analyzer.invoke({"question": "rag from scratch"}).pretty_print()
```

```output
content_search: rag from scratch
title_search: rag from scratch
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: chat langchain
earliest_publish_date: 2023-01-01
latest_publish_date: 2024-01-01
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in an agent, only videos under 5 minutes"
    }
).pretty_print()
```

```output
content_search: multi-modal models agent
title_search: multi-modal models agent
max_length_sec: 300
```

## Alternative : Schéma succinct

Si nous avons de nombreux champs filtrables, un schéma verbeux pourrait nuire aux performances ou ne pas être possible compte tenu des limitations de la taille des schémas de fonction. Dans ces cas, nous pouvons essayer des schémas de requête plus concis qui échangent un peu d'explicité de la direction contre la concision :

```python
from typing import List, Literal, Union


class Filter(BaseModel):
    field: Literal["view_count", "publish_date", "length_sec"]
    comparison: Literal["eq", "lt", "lte", "gt", "gte"]
    value: Union[int, datetime.date] = Field(
        ...,
        description="If field is publish_date then value must be a ISO-8601 format date",
    )


class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description="Filters over specific fields. Final condition is a logical conjunction of all filters.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

```python
structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

Essayons-le :

```python
query_analyzer.invoke({"question": "rag from scratch"}).pretty_print()
```

```output
content_search: rag from scratch
title_search: rag
filters: []
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: 2023
filters: [Filter(field='publish_date', comparison='eq', value=datetime.date(2023, 1, 1))]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in an agent, only videos under 5 minutes and with over 276 views"
    }
).pretty_print()
```

```output
content_search: multi-modal models in an agent
title_search: multi-modal models agent
filters: [Filter(field='length_sec', comparison='lt', value=300), Filter(field='view_count', comparison='gte', value=276)]
```

Nous pouvons voir que l'analyseur gère bien les entiers mais a du mal avec les plages de dates. Nous pouvons essayer d'ajuster notre description de schéma et/ou notre invite pour corriger cela :

```python
class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description=(
            "Filters over specific fields. Final condition is a logical conjunction of all filters. "
            "If a time period longer than one day is specified then it must result in filters that define a date range. "
            f"Keep in mind the current date is {datetime.date.today().strftime('%m-%d-%Y')}."
        ),
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")


structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: chat langchain
filters: [Filter(field='publish_date', comparison='gte', value=datetime.date(2023, 1, 1)), Filter(field='publish_date', comparison='lte', value=datetime.date(2023, 12, 31))]
```

Cela semble fonctionner !

## Tri : aller au-delà de la recherche

Avec certains index, la recherche par champ n'est pas le seul moyen de récupérer les résultats - nous pouvons également trier les documents par un champ et récupérer les meilleurs résultats triés. Avec la requête structurée, cela est facile à prendre en compte en ajoutant des champs de requête séparés qui spécifient comment trier les résultats.

```python
class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        "",
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        "",
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    min_view_count: Optional[int] = Field(
        None, description="Minimum view count filter, inclusive."
    )
    max_view_count: Optional[int] = Field(
        None, description="Maximum view count filter, exclusive."
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None, description="Earliest publish date filter, inclusive."
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None, description="Latest publish date filter, exclusive."
    )
    min_length_sec: Optional[int] = Field(
        None, description="Minimum video length in seconds, inclusive."
    )
    max_length_sec: Optional[int] = Field(
        None, description="Maximum video length in seconds, exclusive."
    )
    sort_by: Literal[
        "relevance",
        "view_count",
        "publish_date",
        "length",
    ] = Field("relevance", description="Attribute to sort by.")
    sort_order: Literal["ascending", "descending"] = Field(
        "descending", description="Whether to sort in ascending or descending order."
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")


structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

```python
query_analyzer.invoke(
    {"question": "What has LangChain released lately?"}
).pretty_print()
```

```output
title_search: LangChain
sort_by: publish_date
```

```python
query_analyzer.invoke({"question": "What are the longest videos?"}).pretty_print()
```

```output
sort_by: length
```

Nous pouvons même prendre en charge la recherche et le tri ensemble. Cela pourrait ressembler à la récupération de tous les résultats au-dessus d'un seuil de pertinence, puis à leur tri selon l'attribut spécifié :

```python
query_analyzer.invoke(
    {"question": "What are the shortest videos about agents?"}
).pretty_print()
```

```output
content_search: agents
sort_by: length
sort_order: ascending
```
