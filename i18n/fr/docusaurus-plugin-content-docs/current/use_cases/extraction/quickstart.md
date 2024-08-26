---
sidebar_position: 0
title: Démarrage rapide
translated: true
---

Dans ce démarrage rapide, nous utiliserons des [modèles de conversation](/docs/modules/model_io/chat/) capables d'**appeler des fonctions/outils** pour extraire des informations à partir de texte.

:::important
L'extraction à l'aide d'**appels de fonctions/outils** ne fonctionne qu'avec les [modèles qui prennent en charge **l'appel de fonctions/outils**](/docs/modules/model_io/chat/function_calling).
:::

## Configuration

Nous utiliserons la méthode de [sortie structurée](/docs/modules/model_io/chat/structured_output) disponible sur les LLM capables d'**appeler des fonctions/outils**.

Sélectionnez un modèle, installez les dépendances pour celui-ci et configurez les clés API !

```python
!pip install langchain

# Install a model capable of tool calling
# pip install langchain-openai
# pip install langchain-mistralai
# pip install langchain-fireworks

# Set env vars for the relevant model or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

## Le schéma

Tout d'abord, nous devons décrire les informations que nous voulons extraire du texte.

Nous utiliserons Pydantic pour définir un schéma d'exemple pour extraire des informations personnelles.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )
```

Il existe deux meilleures pratiques lors de la définition du schéma :

1. Documenter les **attributs** et le **schéma** lui-même : ces informations sont envoyées au LLM et sont utilisées pour améliorer la qualité de l'extraction d'informations.
2. Ne pas forcer le LLM à inventer des informations ! Ci-dessus, nous avons utilisé `Optional` pour les attributs, permettant au LLM de renvoyer `None` s'il ne connaît pas la réponse.

:::important
Pour de meilleures performances, documentez bien le schéma et assurez-vous que le modèle n'est pas forcé de renvoyer des résultats s'il n'y a pas d'informations à extraire dans le texte.
:::

## L'extracteur

Créons un extracteur d'informations à l'aide du schéma que nous avons défini ci-dessus.

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert extraction algorithm. "
            "Only extract relevant information from the text. "
            "If you do not know the value of an attribute asked to extract, "
            "return null for the attribute's value.",
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        # MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)
```

Nous devons utiliser un modèle qui prend en charge l'appel de fonctions/outils.

Veuillez consulter [la sortie structurée](/docs/modules/model_io/chat/structured_output) pour obtenir la liste de certains modèles qui peuvent être utilisés avec cette API.

```python
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-large-latest", temperature=0)

runnable = prompt | llm.with_structured_output(schema=Person)
```

Essayons-le

```python
text = "Alan Smith is 6 feet tall and has blond hair."
runnable.invoke({"text": text})
```

```output
Person(name='Alan Smith', hair_color='blond', height_in_meters='1.8288')
```

:::important

L'extraction est générative 🤯

Les LLM sont des modèles génératifs, donc ils peuvent faire des choses assez cool comme extraire correctement la taille de la personne en mètres
même si elle était fournie en pieds !
:::

## Entités multiples

Dans **la plupart des cas**, vous devriez extraire une liste d'entités plutôt qu'une seule entité.

Cela peut être facilement réalisé en utilisant Pydantic en imbriquant des modèles les uns dans les autres.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

:::important
L'extraction peut ne pas être parfaite ici. Continuez à voir comment utiliser les **exemples de référence** pour améliorer la qualité de l'extraction et consultez la section **directives** !
:::

```python
runnable = prompt | llm.with_structured_output(schema=Data)
text = "My name is Jeff, my hair is black and i am 6 feet tall. Anna has the same color hair as me."
runnable.invoke({"text": text})
```

```output
Data(people=[Person(name='Jeff', hair_color=None, height_in_meters=None), Person(name='Anna', hair_color=None, height_in_meters=None)])
```

:::tip
Lorsque le schéma permet l'extraction de **plusieurs entités**, il permet également au modèle d'extraire **aucune entité** si aucune information pertinente
n'est présente dans le texte en fournissant une liste vide.

C'est généralement une **bonne** chose ! Cela permet de spécifier des attributs **obligatoires** sur une entité sans nécessairement forcer le modèle à détecter cette entité.
:::

## Prochaines étapes

Maintenant que vous comprenez les bases de l'extraction avec LangChain, vous êtes prêt à passer au reste du guide pratique :

- [Ajouter des exemples](/docs/use_cases/extraction/how_to/examples) : Apprenez à utiliser des **exemples de référence** pour améliorer les performances.
- [Gérer les longs textes](/docs/use_cases/extraction/how_to/handle_long_text) : Que devez-vous faire si le texte ne rentre pas dans la fenêtre de contexte du LLM ?
- [Gérer les fichiers](/docs/use_cases/extraction/how_to/handle_files) : Exemples d'utilisation des chargeurs et analyseurs de documents LangChain pour extraire à partir de fichiers comme les PDF.
- [Utiliser une approche d'analyse](/docs/use_cases/extraction/how_to/parse) : Utilisez une approche basée sur les invites pour extraire avec des modèles qui ne prennent pas en charge **l'appel d'outils/de fonctions**.
- [Directives](/docs/use_cases/extraction/guidelines) : Directives pour obtenir de bonnes performances sur les tâches d'extraction.
