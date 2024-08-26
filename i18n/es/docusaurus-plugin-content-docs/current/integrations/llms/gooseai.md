---
translated: true
---

# GooseAI

`GooseAI` es un servicio de NLP totalmente administrado, entregado a través de una API. GooseAI proporciona acceso a [estos modelos](https://goose.ai/docs/models).

Este cuaderno explica cómo usar Langchain con [GooseAI](https://goose.ai/).

## Instalar openai

Se requiere el paquete `openai` para usar la API de GooseAI. Instala `openai` usando `pip install openai`.

```python
%pip install --upgrade --quiet  langchain-openai
```

## Importaciones

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import GooseAI
from langchain_core.prompts import PromptTemplate
```

## Establecer la clave de la API del entorno

Asegúrate de obtener tu clave de API de GooseAI. Se te dan $10 en créditos gratuitos para probar diferentes modelos.

```python
from getpass import getpass

GOOSEAI_API_KEY = getpass()
```

```python
os.environ["GOOSEAI_API_KEY"] = GOOSEAI_API_KEY
```

## Crear la instancia de GooseAI

Puedes especificar diferentes parámetros, como el nombre del modelo, el número máximo de tokens generados, la temperatura, etc.

```python
llm = GooseAI()
```

## Crear una plantilla de solicitud

Crearemos una plantilla de solicitud para Preguntas y Respuestas.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Iniciar la LLMChain

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Ejecutar la LLMChain

Proporciona una pregunta y ejecuta la LLMChain.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
