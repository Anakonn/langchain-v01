---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)** [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) est une plateforme pour exécuter vos propres modèles open-source

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles d'intégration SambaNova

## SambaStudio

**SambaStudio** vous permet d'entraîner, d'exécuter des tâches d'inférence par lots et de déployer des points de terminaison d'inférence en ligne pour exécuter des modèles open source que vous avez affinés vous-même.

Un environnement SambaStudio est requis pour déployer un modèle. Obtenez plus d'informations sur [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

Enregistrez vos variables d'environnement :

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

Appelez directement les intégrations hébergées par SambaStudio depuis LangChain !

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
