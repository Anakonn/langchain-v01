---
translated: true
---

# PipelineAI

>[PipelineAI](https://pipeline.ai) te permite ejecutar tus modelos de ML a escala en la nube. También proporciona acceso a la API a [varios modelos LLM](https://pipeline.ai).

Este cuaderno explica cómo usar Langchain con [PipelineAI](https://docs.pipeline.ai/docs).

## Ejemplo de PipelineAI

[Este ejemplo muestra cómo PipelineAI se integra con LangChain](https://docs.pipeline.ai/docs/langchain) y es creado por PipelineAI.

## Configuración

Se requiere la biblioteca `pipeline-ai` para usar la API `PipelineAI`, también conocida como `Pipeline Cloud`. Instala `pipeline-ai` usando `pip install pipeline-ai`.

```python
# Install the package
%pip install --upgrade --quiet  pipeline-ai
```

## Ejemplo

### Importaciones

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import PipelineAI
from langchain_core.prompts import PromptTemplate
```

### Establecer la clave de la API del entorno

Asegúrate de obtener tu clave de API de PipelineAI. Consulta la [guía de inicio rápido de la nube](https://docs.pipeline.ai/docs/cloud-quickstart). Se te proporcionará un período de prueba gratuito de 30 días con 10 horas de cómputo de GPU sin servidor para probar diferentes modelos.

```python
os.environ["PIPELINE_API_KEY"] = "YOUR_API_KEY_HERE"
```

## Crear la instancia de PipelineAI

Al instanciar PipelineAI, debes especificar el id o la etiqueta de la canalización que deseas usar, por ejemplo, `pipeline_key = "public/gpt-j:base"`. Luego tienes la opción de pasar argumentos clave adicionales específicos de la canalización:

```python
llm = PipelineAI(pipeline_key="YOUR_PIPELINE_KEY", pipeline_kwargs={...})
```

### Crear una plantilla de solicitud

Crearemos una plantilla de solicitud para Preguntas y Respuestas.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### Iniciar la LLMChain

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

### Ejecutar la LLMChain

Proporciona una pregunta y ejecuta la LLMChain.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
