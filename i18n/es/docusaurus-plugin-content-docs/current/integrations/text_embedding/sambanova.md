---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)** [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) es una plataforma para ejecutar tus propios modelos de código abierto

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de incrustación de SambaNova

## SambaStudio

**SambaStudio** te permite entrenar, ejecutar trabajos de inferencia por lotes y desplegar puntos finales de inferencia en línea para ejecutar modelos de código abierto que has ajustado por ti mismo.

Se requiere un entorno de SambaStudio para implementar un modelo. Obtén más información en [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

Registra tus variables de entorno:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_EMBEDDINGS_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_EMBEDDINGS_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_EMBEDDINGS_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_EMBEDDINGS_API_KEY"] = sambastudio_api_key
```

¡Llama a los incrustados alojados de SambaStudio directamente desde LangChain!

```python
from langchain_community.embeddings.sambanova import SambaStudioEmbeddings

embeddings = SambaStudioEmbeddings()

text = "Hello, this is a test"
result = embeddings.embed_query(text)
print(result)

texts = ["Hello, this is a test", "Hello, this is another test"]
results = embeddings.embed_documents(texts)
print(results)
```
