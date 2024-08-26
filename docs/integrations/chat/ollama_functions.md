---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/ollama_functions
sidebar_label: Ollama Functions
translated: false
---

# OllamaFunctions

This notebook shows how to use an experimental wrapper around Ollama that gives it the same API as OpenAI Functions.

Note that more powerful and capable models will perform better with complex schema and/or multiple functions. The examples below use llama3 and phi3 models.
For a complete list of supported models and model variants, see the [Ollama model library](https://ollama.ai/library).

## Setup

Follow [these instructions](https://github.com/jmorganca/ollama) to set up and run a local Ollama instance.

## Usage

You can initialize OllamaFunctions in a similar way to how you'd initialize a standard ChatOllama instance:

```python
from langchain_experimental.llms.ollama_functions import OllamaFunctions

model = OllamaFunctions(model="llama3", format="json")
```

You can then bind functions defined with JSON Schema parameters and a `function_call` parameter to force the model to call the given function:

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

Calling a function with this model then results in JSON output matching the provided schema:

```python
from langchain_core.messages import HumanMessage

model.invoke("what is the weather in Boston?")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'get_current_weather', 'arguments': '{"location": "Boston, MA"}'}}, id='run-1791f9fe-95ad-4ca4-bdf7-9f73eab31e6f-0')
```

## Structured Output

One useful thing you can do with function calling using `with_structured_output()` function is extracting properties from a given input in a structured format:

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

### Extracting data about Alex

```python
alex = chain.invoke("Describe Alex")
alex
```

```output
Person(name='Alex', height=5.0, hair_color='blonde')
```

### Extracting data about Claudia

```python
claudia = chain.invoke("Describe Claudia")
claudia
```

```output
Person(name='Claudia', height=6.0, hair_color='brunette')
```