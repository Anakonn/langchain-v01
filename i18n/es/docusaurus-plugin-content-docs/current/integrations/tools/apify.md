---
translated: true
---

# Apify

Este cuaderno muestra cómo usar la [integración de Apify](/docs/integrations/providers/apify) para LangChain.

[Apify](https://apify.com) es una plataforma en la nube para el web scraping y la extracción de datos, que proporciona un [ecosistema](https://apify.com/store) de más de mil aplicaciones listas para usar llamadas *Actors* para varios casos de uso de web scraping, crawling y extracción de datos. Por ejemplo, puedes usarlo para extraer resultados de búsqueda de Google, perfiles de Instagram y Facebook, productos de Amazon o Shopify, reseñas de Google Maps, etc.

En este ejemplo, usaremos el Actor [Website Content Crawler](https://apify.com/apify/website-content-crawler), que puede rastrear profundamente sitios web como documentación, bases de conocimiento, centros de ayuda o blogs, y extraer el contenido de texto de las páginas web. Luego alimentamos los documentos en un índice de vectores y respondemos preguntas a partir de él.

```python
%pip install --upgrade --quiet  apify-client langchain-openai langchain
```

Primero, importa `ApifyWrapper` en tu código fuente:

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.utilities import ApifyWrapper
from langchain_core.documents import Document
```

Inicialízalo usando tu [token de API de Apify](https://console.apify.com/account/integrations) y, con el propósito de este ejemplo, también con tu clave de API de OpenAI:

```python
import os

os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
os.environ["APIFY_API_TOKEN"] = "Your Apify API token"

apify = ApifyWrapper()
```

Luego ejecuta el Actor, espera a que termine y obtén sus resultados del conjunto de datos de Apify en un cargador de documentos de LangChain.

Ten en cuenta que si ya tienes algunos resultados en un conjunto de datos de Apify, puedes cargarlos directamente usando `ApifyDatasetLoader`, como se muestra en [este cuaderno](/docs/integrations/document_loaders/apify_dataset). En ese cuaderno también encontrarás la explicación de la `dataset_mapping_function`, que se usa para asignar campos de los registros del conjunto de datos de Apify a los campos `Document` de LangChain.

```python
loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={"startUrls": [{"url": "https://python.langchain.com/en/latest/"}]},
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

Inicializa el índice de vectores a partir de los documentos rastreados:

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

Y finalmente, consulta el índice de vectores:

```python
query = "What is LangChain?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 LangChain is a standard interface through which you can interact with a variety of large language models (LLMs). It provides modules that can be used to build language model applications, and it also provides chains and agents with memory capabilities.

https://python.langchain.com/en/latest/modules/models/llms.html, https://python.langchain.com/en/latest/getting_started/getting_started.html
```
