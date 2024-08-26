---
translated: true
---

# ForefrontAI

La plataforma `Forefront` le brinda la capacidad de ajustar y usar [modelos de lenguaje grande de código abierto](https://docs.forefront.ai/forefront/master/models).

Este cuaderno explica cómo usar Langchain con [ForefrontAI](https://www.forefront.ai/).

## Importaciones

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import ForefrontAI
from langchain_core.prompts import PromptTemplate
```

## Establecer la clave de la API del entorno

Asegúrese de obtener su clave de API de ForefrontAI. Se le otorga un período de prueba gratuito de 5 días para probar diferentes modelos.

```python
# get a new token: https://docs.forefront.ai/forefront/api-reference/authentication

from getpass import getpass

FOREFRONTAI_API_KEY = getpass()
```

```python
os.environ["FOREFRONTAI_API_KEY"] = FOREFRONTAI_API_KEY
```

## Crear la instancia de ForefrontAI

Puede especificar diferentes parámetros como la URL del punto final del modelo, la longitud, la temperatura, etc. Debe proporcionar una URL de punto final.

```python
llm = ForefrontAI(endpoint_url="YOUR ENDPOINT URL HERE")
```

## Crear una plantilla de solicitud

Crearemos una plantilla de solicitud para Preguntas y Respuestas.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Iniciar la cadena LLM

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Ejecutar la cadena LLM

Proporcione una pregunta y ejecute la cadena LLM.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
