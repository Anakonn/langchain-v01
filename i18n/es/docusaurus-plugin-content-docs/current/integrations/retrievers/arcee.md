---
translated: true
---

# Arcee

>[Arcee](https://www.arcee.ai/about/about-us) ayuda con el desarrollo de los SLM: modelos de lenguaje pequeños, especializados, seguros y escalables.

Este cuaderno demuestra cómo usar la clase `ArceeRetriever` para recuperar el/los documento(s) relevante(s) para los `Modelos de Lenguaje Adaptados al Dominio` (`DALMs`) de Arcee.

### Configuración

Antes de usar `ArceeRetriever`, asegúrese de que la clave de la API de Arcee esté establecida como la variable de entorno `ARCEE_API_KEY`. También puede pasar la clave de la API como un parámetro con nombre.

```python
from langchain_community.retrievers import ArceeRetriever

retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### Configuración adicional

También puede configurar los parámetros de `ArceeRetriever` como `arcee_api_url`, `arcee_app_url` y `model_kwargs` según sea necesario.
Establecer los `model_kwargs` en la inicialización del objeto usa los filtros y el tamaño como predeterminado para todas las recuperaciones posteriores.

```python
retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY", # if not already set in the environment
    arcee_api_url="https://custom-api.arcee.ai",  # default is https://api.arcee.ai
    arcee_app_url="https://custom-app.arcee.ai",  # default is https://app.arcee.ai
    model_kwargs={
        "size": 5,
        "filters": [
            {
                "field_name": "document",
                "filter_type": "fuzzy_search",
                "value": "Einstein",
            }
        ],
    },
)
```

### Recuperación de documentos

Puede recuperar los documentos relevantes de los contextos cargados proporcionando una consulta. Aquí hay un ejemplo:

```python
query = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
documents = retriever.invoke(query)
```

### Parámetros adicionales

Arcee le permite aplicar `filtros` y establecer el `tamaño` (en términos de recuento) de los documentos recuperados. Los filtros ayudan a reducir los resultados. Así es como usar estos parámetros:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Music"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Retrieve documents with filters and size params
documents = retriever.invoke(query, size=5, filters=filters)
```
