---
sidebar_label: Funciones de Ollama
translated: true
---

# Funciones de Ollama

Este cuaderno muestra cómo usar un envoltorio experimental alrededor de Ollama que le da la misma API que las Funciones de OpenAI.

Tenga en cuenta que los modelos más potentes y capaces tendrán un mejor rendimiento con esquemas complejos y/o múltiples funciones. Los ejemplos a continuación utilizan los modelos llama3 y phi3.
Para obtener una lista completa de los modelos y variantes de modelos compatibles, consulte la [biblioteca de modelos de Ollama](https://ollama.ai/library).

## Configuración

Siga [estas instrucciones](https://github.com/jmorganca/ollama) para configurar y ejecutar una instancia local de Ollama.

## Uso

Puede inicializar OllamaFunctions de manera similar a cómo inicializaría una instancia estándar de ChatOllama:

```python
from langchain_experimental.llms.ollama_functions import OllamaFunctions

model = OllamaFunctions(model="llama3", format="json")
```

Luego puede vincular funciones definidas con parámetros de esquema JSON y un parámetro `function_call` para forzar que el modelo llame a la función dada:

```python
model = model.bind_tools(
    tools=[
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, " "e.g. San Francisco, CA",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        }
    ],
    function_call={"name": "get_current_weather"},
)
```

Llamar a una función con este modelo luego da como resultado una salida JSON que coincide con el esquema proporcionado:

```python
from langchain_core.messages import HumanMessage

model.invoke("what is the weather in Boston?")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'get_current_weather', 'arguments': '{"location": "Boston, MA"}'}}, id='run-1791f9fe-95ad-4ca4-bdf7-9f73eab31e6f-0')
```

## Salida estructurada

Una cosa útil que puede hacer con la llamada de funciones usando la función `with_structured_output()` es extraer propiedades de una entrada dada en un formato estructurado:

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field


# Schema for structured response
class Person(BaseModel):
    name: str = Field(description="The person's name", required=True)
    height: float = Field(description="The person's height", required=True)
    hair_color: str = Field(description="The person's hair color")


# Prompt template
prompt = PromptTemplate.from_template(
    """Alex is 5 feet tall.
Claudia is 1 feet taller than Alex and jumps higher than him.
Claudia is a brunette and Alex is blonde.

Human: {question}
AI: """
)

# Chain
llm = OllamaFunctions(model="phi3", format="json", temperature=0)
structured_llm = llm.with_structured_output(Person)
chain = prompt | structured_llm
```

### Extracción de datos sobre Alex

```python
alex = chain.invoke("Describe Alex")
alex
```

```output
Person(name='Alex', height=5.0, hair_color='blonde')
```

### Extracción de datos sobre Claudia

```python
claudia = chain.invoke("Describe Claudia")
claudia
```

```output
Person(name='Claudia', height=6.0, hair_color='brunette')
```
