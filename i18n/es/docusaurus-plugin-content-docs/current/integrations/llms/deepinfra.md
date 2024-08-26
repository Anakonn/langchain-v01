---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) es un servicio de inferencia sin servidor que proporciona acceso a una [variedad de LLM](https://deepinfra.com/models?utm_source=langchain) y [modelos de incrustación](https://deepinfra.com/models?type=embeddings&utm_source=langchain). Este cuaderno explica cómo usar LangChain con DeepInfra para modelos de lenguaje.

## Establecer la clave de la API del entorno

Asegúrese de obtener su clave de API de DeepInfra. Tienes que [Iniciar sesión](https://deepinfra.com/login?from=%2Fdash) y obtener un nuevo token.

Se le otorga 1 hora gratuita de cómputo de GPU sin servidor para probar diferentes modelos. (ver [aquí](https://github.com/deepinfra/deepctl#deepctl))
Puede imprimir su token con `deepctl auth token`

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```

```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

## Crear la instancia de DeepInfra

También puede usar nuestra herramienta de código abierto [deepctl](https://github.com/deepinfra/deepctl#deepctl) para administrar sus implementaciones de modelos. Puede ver una lista de los parámetros disponibles [aquí](https://deepinfra.com/databricks/dolly-v2-12b#API).

```python
from langchain_community.llms import DeepInfra

llm = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
llm.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
```

```python
# run inferences directly via wrapper
llm("Who let the dogs out?")
```

```output
'This is a question that has puzzled many people'
```

```python
# run streaming inference
for chunk in llm.stream("Who let the dogs out?"):
    print(chunk)
```

```output
 Will
 Smith
.
```

## Crear una plantilla de solicitud

Crearemos una plantilla de solicitud para Preguntas y Respuestas.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Iniciar la LLMChain

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Ejecutar la LLMChain

Proporcione una pregunta y ejecute la LLMChain.

```python
question = "Can penguins reach the North pole?"

llm_chain.run(question)
```

```output
"Penguins are found in Antarctica and the surrounding islands, which are located at the southernmost tip of the planet. The North Pole is located at the northernmost tip of the planet, and it would be a long journey for penguins to get there. In fact, penguins don't have the ability to fly or migrate over such long distances. So, no, penguins cannot reach the North Pole. "
```
