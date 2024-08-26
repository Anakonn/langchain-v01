---
sidebar_class_name: hidden
translated: true
---

# [Obsoleto] Envoltorio experimental de herramientas de Anthropic

::: {.callout-warning}

La API de Anthropic admite oficialmente la llamada a herramientas, por lo que este método alternativo ya no es necesario. Por favor, utiliza [ChatAnthropic](/docs/integrations/chat/anthropic) con `langchain-anthropic>=0.1.5`.

:::

Este cuaderno muestra cómo utilizar un envoltorio experimental alrededor de Anthropic que le otorga capacidades de llamada a herramientas y salida estructurada. Sigue la guía de Anthropic [aquí](https://docs.anthropic.com/claude/docs/functions-external-tools)

El envoltorio está disponible en el paquete `langchain-anthropic` y también requiere la dependencia opcional `defusedxml` para analizar la salida XML del modelo de lenguaje.

Nota: esta es una función beta que será reemplazada por la implementación formal de la llamada a herramientas de Anthropic, pero es útil para pruebas y experimentación mientras tanto.

```python
%pip install -qU langchain-anthropic defusedxml
from langchain_anthropic.experimental import ChatAnthropicTools
```

## Enlace de herramientas

`ChatAnthropicTools` expone un método `bind_tools` que permite pasar modelos Pydantic o BaseTools al modelo de lenguaje.

```python
from langchain_core.pydantic_v1 import BaseModel


class Person(BaseModel):
    name: str
    age: int


model = ChatAnthropicTools(model="claude-3-opus-20240229").bind_tools(tools=[Person])
model.invoke("I am a 27 year old named Erick")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'Person', 'arguments': '{"name": "Erick", "age": "27"}'}, 'type': 'function'}]})
```

## Salida estructurada

`ChatAnthropicTools` también implementa la especificación [`with_structured_output`](/docs/modules/model_io/chat/structured_output) para extraer valores. Nota: esto puede no ser tan estable como con modelos que ofrecen explícitamente la llamada a herramientas.

```python
chain = ChatAnthropicTools(model="claude-3-opus-20240229").with_structured_output(
    Person
)
chain.invoke("I am a 27 year old named Erick")
```

```output
Person(name='Erick', age=27)
```
