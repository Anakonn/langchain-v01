---
sidebar_position: 3
title: Inicio rápido
translated: true
---

Los modelos de lenguaje generan texto. Pero muchas veces es posible que desee obtener información más estructurada que solo texto. Aquí es donde entran en juego los analizadores de salida.

Los analizadores de salida son clases que ayudan a estructurar las respuestas de los modelos de lenguaje. Hay dos métodos principales que un analizador de salida debe implementar:

- "Obtener instrucciones de formato": un método que devuelve una cadena que contiene instrucciones sobre cómo debe formatearse la salida de un modelo de lenguaje.
- "Analizar": un método que toma una cadena (se supone que es la respuesta de un modelo de lenguaje) y la analiza en alguna estructura.

Y luego uno opcional:

- "Analizar con indicación": un método que toma una cadena (se supone que es la respuesta de un modelo de lenguaje) y una indicación (se supone que es la indicación que generó dicha respuesta) y la analiza en alguna estructura. La indicación se proporciona en caso de que el OutputParser quiera volver a intentar o corregir la salida de alguna manera y necesite información de la indicación para hacerlo.

## Comenzar

A continuación, analizaremos el principal tipo de analizador de salida, el `PydanticOutputParser`.

```python
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import OpenAI

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


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


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

## LCEL

Los analizadores de salida implementan la [interfaz Runnable](/docs/expression_language/interface), el bloque de construcción básico del [Lenguaje de Expresión LangChain (LCEL)](/docs/expression_language/). Esto significa que admiten llamadas `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log`.

Los analizadores de salida aceptan una cadena o `BaseMessage` como entrada y pueden devolver un tipo arbitrario.

```python
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

En lugar de invocar manualmente el analizador, también podríamos haberlo agregado a nuestra secuencia `Runnable`:

```python
chain = prompt | model | parser
chain.invoke({"query": "Tell me a joke."})
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

Si bien todos los analizadores admiten la interfaz de transmisión, solo ciertos analizadores pueden transmitir a través de objetos parcialmente analizados, ya que esto depende en gran medida del tipo de salida. Los analizadores que no pueden construir objetos parciales simplemente devolverán la salida completamente analizada.

El `SimpleJsonOutputParser` por ejemplo puede transmitir a través de salidas parciales:

```python
from langchain.output_parsers.json import SimpleJsonOutputParser

json_prompt = PromptTemplate.from_template(
    "Return a JSON object with an `answer` key that answers the following question: {question}"
)
json_parser = SimpleJsonOutputParser()
json_chain = json_prompt | model | json_parser
```

```python
list(json_chain.stream({"question": "Who invented the microscope?"}))
```

```output
[{},
 {'answer': ''},
 {'answer': 'Ant'},
 {'answer': 'Anton'},
 {'answer': 'Antonie'},
 {'answer': 'Antonie van'},
 {'answer': 'Antonie van Lee'},
 {'answer': 'Antonie van Leeu'},
 {'answer': 'Antonie van Leeuwen'},
 {'answer': 'Antonie van Leeuwenho'},
 {'answer': 'Antonie van Leeuwenhoek'}]
```

Mientras que el PydanticOutputParser no puede:

```python
list(chain.stream({"query": "Tell me a joke."}))
```

```output
[Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')]
```
