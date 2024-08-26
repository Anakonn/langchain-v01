---
sidebar_class_name: hidden
title: Étiquetage
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/tagging.ipynb)

## Cas d'utilisation

L'étiquetage signifie l'attribution d'étiquettes à un document avec des classes telles que :

- sentiment
- langue
- style (formel, informel, etc.)
- sujets couverts
- tendance politique

![Description de l'image](../../../../../static/img/tagging.png)

## Aperçu

L'étiquetage comporte quelques composants :

* `function` : Comme [l'extraction](/docs/use_cases/extraction), l'étiquetage utilise des [fonctions](https://openai.com/blog/function-calling-and-other-api-updates) pour spécifier comment le modèle doit étiqueter un document
* `schema` : définit comment nous voulons étiqueter le document

## Démarrage rapide

Voyons un exemple très simple de la façon dont nous pouvons utiliser l'outil d'appel OpenAI pour l'étiquetage dans LangChain. Nous utiliserons la méthode [`with_structured_output`](/docs/modules/model_io/chat/structured_output) prise en charge par les modèles OpenAI :

```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

Définissons un modèle Pydantic avec quelques propriétés et leur type attendu dans notre schéma.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

tagging_prompt = ChatPromptTemplate.from_template(
    """
Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
"""
)


class Classification(BaseModel):
    sentiment: str = Field(description="The sentiment of the text")
    aggressiveness: int = Field(
        description="How aggressive the text is on a scale from 1 to 10"
    )
    language: str = Field(description="The language the text is written in")


# LLM
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0125").with_structured_output(
    Classification
)

tagging_chain = tagging_prompt | llm
```

```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
tagging_chain.invoke({"input": inp})
```

```output
Classification(sentiment='positive', aggressiveness=1, language='Spanish')
```

Si nous voulons une sortie JSON, nous pouvons simplement appeler `.dict()`

```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
res = tagging_chain.invoke({"input": inp})
res.dict()
```

```output
{'sentiment': 'negative', 'aggressiveness': 8, 'language': 'Spanish'}
```

Comme nous pouvons le voir dans les exemples, il interprète correctement ce que nous voulons.

Les résultats varient de sorte que nous puissions obtenir, par exemple, des sentiments dans différentes langues ('positif', 'enojado' etc.).

Nous verrons comment contrôler ces résultats dans la prochaine section.

## Contrôle plus fin

Une définition de schéma attentive nous donne plus de contrôle sur la sortie du modèle.

Plus précisément, nous pouvons définir :

- les valeurs possibles pour chaque propriété
- la description pour s'assurer que le modèle comprenne la propriété
- les propriétés requises à renvoyer

Redéfinissons notre modèle Pydantic pour contrôler chacun des aspects mentionnés précédemment à l'aide d'énumérations :

```python
class Classification(BaseModel):
    sentiment: str = Field(..., enum=["happy", "neutral", "sad"])
    aggressiveness: int = Field(
        ...,
        description="describes how aggressive the statement is, the higher the number the more aggressive",
        enum=[1, 2, 3, 4, 5],
    )
    language: str = Field(
        ..., enum=["spanish", "english", "french", "german", "italian"]
    )
```

```python
tagging_prompt = ChatPromptTemplate.from_template(
    """
Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
"""
)

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0125").with_structured_output(
    Classification
)

chain = tagging_prompt | llm
```

Maintenant, les réponses seront restreintes de la manière attendue !

```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='happy', aggressiveness=1, language='spanish')
```

```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='sad', aggressiveness=5, language='spanish')
```

```python
inp = "Weather is ok here, I can go outside without much more than a coat"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='neutral', aggressiveness=2, language='english')
```

La [trace LangSmith](https://smith.langchain.com/public/38294e04-33d8-4c5a-ae92-c2fe68be8332/r) nous permet de regarder sous le capot :

![Description de l'image](../../../../../static/img/tagging_trace.png)

### Aller plus loin

* Vous pouvez utiliser le [transformateur d'étiquetage de métadonnées](/docs/integrations/document_transformers/openai_metadata_tagger) pour extraire les métadonnées d'un document LangChain.
* Cela couvre la même fonctionnalité de base que la chaîne d'étiquetage, appliquée uniquement à un document LangChain.
