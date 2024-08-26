---
translated: true
---

# Analizador YAML

Este analizador de salida permite a los usuarios especificar un esquema arbitrario y consultar LLM para obtener salidas que se ajusten a ese esquema, utilizando YAML para dar formato a su respuesta.

¡Tenga en cuenta que los modelos de lenguaje a gran escala son abstracciones con fugas! Tendrá que usar un LLM con capacidad suficiente para generar YAML bien formado. En la familia de OpenAI, DaVinci puede hacerlo de manera confiable, pero la capacidad de Curie ya se reduce drásticamente.

Opcionalmente, puede usar Pydantic para declarar su modelo de datos.

```python
from typing import List

from langchain.output_parsers import YamlOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
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
```

```python
# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = YamlOutputParser(pydantic_object=Joke)

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

Encuentre la documentación de la API para [YamlOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser).
