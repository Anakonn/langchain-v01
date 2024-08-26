---
translated: true
---

# Arcee

Este cuaderno demuestra cómo usar la clase `Arcee` para generar texto utilizando los Modelos de Lenguaje Adaptados al Dominio (DALM) de Arcee.

### Configuración

Antes de usar Arcee, asegúrese de que la clave API de Arcee esté establecida como la variable de entorno `ARCEE_API_KEY`. También puede pasar la clave API como un parámetro con nombre.

```python
from langchain_community.llms import Arcee

# Create an instance of the Arcee class
arcee = Arcee(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### Configuración adicional

También puede configurar los parámetros de Arcee, como `arcee_api_url`, `arcee_app_url` y `model_kwargs` según sea necesario.
Establecer los `model_kwargs` en la inicialización del objeto utiliza los parámetros como predeterminados para todas las llamadas posteriores a la respuesta de generación.

```python
arcee = Arcee(
    model="DALM-Patent",
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

### Generación de texto

Puede generar texto de Arcee proporcionando un mensaje inicial. Aquí hay un ejemplo:

```python
# Generate text
prompt = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
response = arcee(prompt)
```

### Parámetros adicionales

Arcee permite aplicar `filtros` y establecer el `tamaño` (en términos de recuento) de los documentos recuperados para ayudar a la generación de texto. Los filtros ayudan a reducir los resultados. Así es como usar estos parámetros:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Einstein"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Generate text with filters and size params
response = arcee(prompt, size=5, filters=filters)
```
