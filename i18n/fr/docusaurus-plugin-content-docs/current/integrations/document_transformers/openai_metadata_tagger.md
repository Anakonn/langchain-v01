---
translated: true
---

# Tagueur de métadonnées OpenAI

Il peut souvent être utile de taguer des documents ingérés avec des métadonnées structurées, telles que le titre, le ton ou la longueur d'un document, pour permettre une recherche de similarité plus ciblée par la suite. Cependant, pour un grand nombre de documents, effectuer ce processus de labellisation manuellement peut être fastidieux.

Le transformateur de documents `OpenAIMetadataTagger` automatise ce processus en extrayant les métadonnées de chaque document fourni selon un schéma fourni. Il utilise une chaîne configurable alimentée par `OpenAI Functions` en arrière-plan, donc si vous passez une instance LLM personnalisée, elle doit être un modèle `OpenAI` avec prise en charge des fonctions.

**Remarque :** Ce transformateur de documents fonctionne mieux avec des documents complets, il est donc préférable de l'exécuter d'abord avec des documents entiers avant de procéder à tout autre découpage ou traitement !

Par exemple, disons que vous vouliez indexer un ensemble de critiques de films. Vous pourriez initialiser le transformateur de documents avec un objet `JSON Schema` valide comme suit :

```python
from langchain_community.document_transformers.openai_functions import (
    create_metadata_tagger,
)
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
```

```python
schema = {
    "properties": {
        "movie_title": {"type": "string"},
        "critic": {"type": "string"},
        "tone": {"type": "string", "enum": ["positive", "negative"]},
        "rating": {
            "type": "integer",
            "description": "The number of stars the critic rated the movie",
        },
    },
    "required": ["movie_title", "critic", "tone"],
}

# Must be an OpenAI model that supports functions
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

document_transformer = create_metadata_tagger(metadata_schema=schema, llm=llm)
```

Vous pouvez ensuite simplement passer au transformateur de documents une liste de documents, et il extraira les métadonnées du contenu :

```python
original_documents = [
    Document(
        page_content="Review of The Bee Movie\nBy Roger Ebert\n\nThis is the greatest movie ever made. 4 out of 5 stars."
    ),
    Document(
        page_content="Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.",
        metadata={"reliable": False},
    ),
]

enhanced_documents = document_transformer.transform_documents(original_documents)
```

```python
import json

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

Les nouveaux documents peuvent ensuite être traités par un découpeur de texte avant d'être chargés dans un magasin vectoriel. Les champs extraits ne remplaceront pas les métadonnées existantes.

Vous pouvez également initialiser le transformateur de documents avec un schéma Pydantic :

```python
from typing import Literal

from pydantic import BaseModel, Field


class Properties(BaseModel):
    movie_title: str
    critic: str
    tone: Literal["positive", "negative"]
    rating: int = Field(description="Rating out of 5 stars")


document_transformer = create_metadata_tagger(Properties, llm)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

## Personnalisation

Vous pouvez passer à la chaîne de taggage sous-jacente les arguments standard de LLMChain dans le constructeur du transformateur de documents. Par exemple, si vous vouliez demander au LLM de se concentrer sur des détails spécifiques dans les documents d'entrée, ou d'extraire des métadonnées dans un certain style, vous pourriez passer une invite personnalisée :

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    """Extract relevant information from the following text.
Anonymous critics are actually Roger Ebert.

{input}
"""
)

document_transformer = create_metadata_tagger(schema, llm, prompt=prompt)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Roger Ebert", "tone": "negative", "rating": 1, "reliable": false}
```
