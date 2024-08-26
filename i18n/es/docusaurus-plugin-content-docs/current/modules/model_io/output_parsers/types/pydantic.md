---
translated: true
---

# Analizador Pydantic

Este analizador de salida permite a los usuarios especificar un Modelo Pydantic arbitrario y consultar LLM para obtener salidas que se ajusten a ese esquema.

Tenga en cuenta que los modelos de lenguaje a gran escala son abstracciones con fugas. Tendrá que usar un LLM con capacidad suficiente para generar JSON bien formado. En la familia de OpenAI, DaVinci puede hacerlo de manera confiable, pero la capacidad de [Curie](https://wiprotechblogs.medium.com/davinci-vs-curie-a-comparison-between-gpt-3-engines-for-extractive-summarization-b568d4633b3b) ya se reduce dramáticamente.

Utilice Pydantic para declarar su modelo de datos. BaseModel de Pydantic es como una dataclass de Python, pero con comprobación de tipos real + coerción.

```python
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(temperature=0)
```

```python
# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')
```

```python
# Here's another example, but with a compound typed field.
class Actor(BaseModel):
    name: str = Field(description="name of an actor")
    film_names: List[str] = Field(description="list of names of films they starred in")


actor_query = "Generate the filmography for a random actor."

parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": actor_query})
```

```output
Actor(name='Tom Hanks', film_names=['Forrest Gump', 'Cast Away', 'Saving Private Ryan', 'Toy Story', 'The Green Mile'])
```

Encuentra la documentación de la API para [PydanticOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html#langchain_core.output_parsers.pydantic.PydanticOutputParser).
