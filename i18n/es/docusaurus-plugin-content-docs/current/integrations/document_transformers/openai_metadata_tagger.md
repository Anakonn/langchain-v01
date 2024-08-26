---
translated: true
---

# Etiquetador de metadatos de OpenAI

A menudo puede ser útil etiquetar los documentos ingeridos con metadatos estructurados, como el título, el tono o la longitud de un documento, para permitir una búsqueda de similitud más específica más adelante. Sin embargo, para grandes cantidades de documentos, realizar este proceso de etiquetado manualmente puede ser tedioso.

El transformador de documentos `OpenAIMetadataTagger` automatiza este proceso extrayendo metadatos de cada documento proporcionado de acuerdo con un esquema proporcionado. Utiliza una cadena configurable alimentada por `OpenAI Functions` debajo del capó, por lo que si pasa una instancia de LLM personalizada, debe ser un modelo `OpenAI` con soporte de funciones.

**Nota:** ¡Este transformador de documentos funciona mejor con documentos completos, por lo que es mejor ejecutarlo primero con documentos completos antes de realizar cualquier otra división o procesamiento!

Por ejemplo, digamos que desea indexar un conjunto de reseñas de películas. Puede inicializar el transformador de documentos con un objeto `JSON Schema` válido de la siguiente manera:

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

Luego, simplemente puede pasar el transformador de documentos una lista de documentos, y extraerá los metadatos del contenido:

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

Los nuevos documentos se pueden procesar aún más mediante un divisor de texto antes de cargarlos en un almacén de vectores. Los campos extraídos no sobrescribirán los metadatos existentes.

También puede inicializar el transformador de documentos con un esquema Pydantic:

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

## Personalización

Puede pasar los argumentos estándar de LLMChain a la cadena de etiquetado subyacente en el constructor del transformador de documentos. Por ejemplo, si quisiera que el LLM se enfocara en detalles específicos en los documentos de entrada o extrajera metadatos de una cierta manera, podría pasar un aviso personalizado:

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
