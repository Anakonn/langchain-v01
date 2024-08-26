---
translated: true
---

# CerebriumAI

`Cerebrium` es una alternativa a AWS Sagemaker. También proporciona acceso a la API a [varios modelos LLM](https://docs.cerebrium.ai/cerebrium/prebuilt-models/deployment).

Este cuaderno explica cómo usar Langchain con [CerebriumAI](https://docs.cerebrium.ai/introduction).

## Instalar cerebrium

Se requiere el paquete `cerebrium` para usar la API `CerebriumAI`. Instala `cerebrium` usando `pip3 install cerebrium`.

```python
# Install the package
!pip3 install cerebrium
```

## Importaciones

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import CerebriumAI
from langchain_core.prompts import PromptTemplate
```

## Establecer la clave de la API del entorno

Asegúrate de obtener tu clave de API de CerebriumAI. Consulta [aquí](https://dashboard.cerebrium.ai/login). Se te otorga 1 hora gratuita de cómputo de GPU sin servidor para probar diferentes modelos.

```python
os.environ["CEREBRIUMAI_API_KEY"] = "YOUR_KEY_HERE"
```

## Crear la instancia de CerebriumAI

Puedes especificar diferentes parámetros como la URL del punto final del modelo, la longitud máxima, la temperatura, etc. Debes proporcionar una URL de punto final.

```python
llm = CerebriumAI(endpoint_url="YOUR ENDPOINT URL HERE")
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
