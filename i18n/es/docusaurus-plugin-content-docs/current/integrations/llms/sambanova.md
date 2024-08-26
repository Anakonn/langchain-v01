---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)** [Sambaverse](https://sambaverse.sambanova.ai/) y [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) son plataformas para ejecutar tus propios modelos de código abierto

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de SambaNova

## Sambaverse

**Sambaverse** te permite interactuar con múltiples modelos de código abierto. Puedes ver la lista de modelos disponibles e interactuar con ellos en el [playground](https://sambaverse.sambanova.ai/playground).
 **Tenga en cuenta que la oferta gratuita de Sambaverse tiene un rendimiento limitado.** Las empresas que estén listas para evaluar el rendimiento de producción de tokens por segundo, el volumen de procesamiento y un costo total de propiedad (TCO) un 10% menor deben [contactarnos](https://sambaverse.sambanova.ai/contact-us) para obtener una instancia de evaluación sin limitaciones.

Se requiere una clave de API para acceder a los modelos de Sambaverse. Para obtener una clave, crea una cuenta en [sambaverse.sambanova.ai](https://sambaverse.sambanova.ai/)

El paquete [sseclient-py](https://pypi.org/project/sseclient-py/) es necesario para ejecutar predicciones en streaming

```python
%pip install --quiet sseclient-py==1.8.0
```

Registra tu clave de API como una variable de entorno:

```python
import os

sambaverse_api_key = "<Your sambaverse API key>"

# Set the environment variables
os.environ["SAMBAVERSE_API_KEY"] = sambaverse_api_key
```

¡Llama a los modelos de Sambaverse directamente desde LangChain!

```python
from langchain_community.llms.sambanova import Sambaverse

llm = Sambaverse(
    sambaverse_model_name="Meta/llama-2-7b-chat-hf",
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": True,
        "select_expert": "llama-2-7b-chat-hf",
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```

## SambaStudio

**SambaStudio** te permite entrenar, ejecutar trabajos de inferencia por lotes y desplegar puntos finales de inferencia en línea para ejecutar modelos de código abierto que hayas ajustado por sí mismo.

Se requiere un entorno de SambaStudio para implementar un modelo. Obtén más información en [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

El paquete [sseclient-py](https://pypi.org/project/sseclient-py/) es necesario para ejecutar predicciones en streaming

```python
%pip install --quiet sseclient-py==1.8.0
```

Registra tus variables de entorno:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

¡Llama a los modelos de SambaStudio directamente desde LangChain!

```python
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_logprobs": {"type": "int", "value": "0"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```
