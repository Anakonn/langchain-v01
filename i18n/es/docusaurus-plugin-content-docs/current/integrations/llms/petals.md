---
translated: true
---

# Pétalos

`Petals` ejecuta modelos de lenguaje de más de 100 mil millones en casa, estilo BitTorrent.

Este cuaderno explica cómo usar Langchain con [Petals](https://github.com/bigscience-workshop/petals).

## Instalar petals

Se requiere el paquete `petals` para usar la API de Petals. Instala `petals` usando `pip3 install petals`.

Para usuarios de Apple Silicon (M1/M2), sigue esta guía [https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642](https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642) para instalar petals.

```python
!pip3 install petals
```

## Importaciones

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import Petals
from langchain_core.prompts import PromptTemplate
```

## Establecer la clave de la API del entorno

Asegúrate de obtener [tu clave de API](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token) de Hugging Face.

```python
from getpass import getpass

HUGGINGFACE_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["HUGGINGFACE_API_KEY"] = HUGGINGFACE_API_KEY
```

## Crear la instancia de Petals

Puedes especificar diferentes parámetros como el nombre del modelo, el número máximo de nuevos tokens, la temperatura, etc.

```python
# this can take several minutes to download big files!

llm = Petals(model_name="bigscience/bloom-petals")
```

```output
Downloading:   1%|▏                        | 40.8M/7.19G [00:24<15:44, 7.57MB/s]
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

Proporciona una pregunta y ejecuta la cadena LLM.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
