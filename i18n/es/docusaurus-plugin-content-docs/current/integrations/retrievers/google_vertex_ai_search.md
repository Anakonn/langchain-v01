---
translated: true
---

# Google Vertex AI Search

>[Google Vertex AI Search](https://cloud.google.com/enterprise-search) (anteriormente conocido como `Enterprise Search` en `Generative AI App Builder`) es parte de la plataforma de aprendizaje automático [Vertex AI](https://cloud.google.com/vertex-ai) ofrecida por `Google Cloud`.
>
>`Vertex AI Search` permite a las organizaciones construir rápidamente motores de búsqueda impulsados por IA generativa para clientes y empleados. Se basa en una variedad de tecnologías de `Google Search`, incluida la búsqueda semántica, que ayuda a entregar resultados más relevantes que las técnicas de búsqueda basadas en palabras clave tradicionales al usar técnicas de procesamiento del lenguaje natural y aprendizaje automático para inferir relaciones dentro del contenido y la intención a partir de la entrada de consulta del usuario. Vertex AI Search también se beneficia de la experiencia de Google en comprender cómo buscan los usuarios y tener en cuenta la relevancia del contenido para ordenar los resultados mostrados.

>`Vertex AI Search` está disponible en la `Google Cloud Console` y a través de una API para la integración de flujos de trabajo empresariales.

Este cuaderno demuestra cómo configurar `Vertex AI Search` y usar el recuperador de Vertex AI Search. El recuperador de Vertex AI Search encapsula la [biblioteca de clientes de Python](https://cloud.google.com/generative-ai-app-builder/docs/libraries#client-libraries-install-python) y la usa para acceder a la [API del servicio de búsqueda](https://cloud.google.com/python/docs/reference/discoveryengine/latest/google.cloud.discoveryengine_v1beta.services.search_service).

## Instalar los requisitos previos

Necesitas instalar el paquete `google-cloud-discoveryengine` para usar el recuperador de Vertex AI Search.

```python
%pip install --upgrade --quiet google-cloud-discoveryengine
```

## Configurar el acceso a Google Cloud y Vertex AI Search

Vertex AI Search está generalmente disponible sin lista de permitidos a partir de agosto de 2023.

Antes de poder usar el recuperador, necesitas completar los siguientes pasos:

### Crear un motor de búsqueda y poblar un almacén de datos no estructurados

- Sigue las instrucciones en la [Guía de inicio rápido de Vertex AI Search](https://cloud.google.com/generative-ai-app-builder/docs/try-enterprise-search) para configurar un proyecto de Google Cloud y Vertex AI Search.
- [Usa la consola de Google Cloud para crear un almacén de datos no estructurados](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es#unstructured-data)
  - Llénalo con los documentos PDF de ejemplo de la carpeta `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs` de Google Cloud Storage.
  - Asegúrate de usar la opción `Cloud Storage (sin metadatos)`.

### Establecer credenciales para acceder a la API de Vertex AI Search

Las [bibliotecas de clientes de Vertex AI Search](https://cloud.google.com/generative-ai-app-builder/docs/libraries) utilizadas por el recuperador de Vertex AI Search proporcionan soporte de alto nivel para la autenticación en Google Cloud de forma programática.
Las bibliotecas de clientes admiten [Credenciales predeterminadas de aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials); las bibliotecas buscan credenciales en un conjunto de ubicaciones definidas y usan esas credenciales para autenticar las solicitudes a la API.
Con ADC, puedes poner las credenciales a disposición de tu aplicación en una variedad de entornos, como desarrollo local o producción, sin necesidad de modificar el código de tu aplicación.

Si se ejecuta en [Google Colab](https://colab.google), autentíquese con `google.colab.google.auth`, de lo contrario, siga uno de los [métodos compatibles](https://cloud.google.com/docs/authentication/application-default-credentials) para asegurarse de que las Credenciales predeterminadas de aplicación estén configuradas correctamente.

```python
import sys

if "google.colab" in sys.modules:
    from google.colab import auth as google_auth

    google_auth.authenticate_user()
```

## Configurar y usar el recuperador de Vertex AI Search

El recuperador de Vertex AI Search se implementa en la clase `langchain.retriever.GoogleVertexAISearchRetriever`. El método `get_relevant_documents` devuelve una lista de documentos `langchain.schema.Document` donde el campo `page_content` de cada documento se rellena con el contenido del documento.
Dependiendo del tipo de datos utilizado en Vertex AI Search (sitio web, estructurado o no estructurado), el campo `page_content` se rellena de la siguiente manera:

- Sitio web con indexación avanzada: una `respuesta extractiva` que coincide con una consulta. El campo `metadata` se rellena con los metadatos (si los hay) del documento del que se extrajeron los segmentos o respuestas.
- Fuente de datos no estructurados: ya sea un `segmento extractivo` o una `respuesta extractiva` que coincide con una consulta. El campo `metadata` se rellena con los metadatos (si los hay) del documento del que se extrajeron los segmentos o respuestas.
- Fuente de datos estructurados: una cadena json que contiene todos los campos devueltos desde la fuente de datos estructurados. El campo `metadata` se rellena con los metadatos (si los hay) del documento.

### Respuestas extractivas y segmentos extractivos

Una respuesta extractiva es un texto literal que se devuelve con cada resultado de búsqueda. Se extrae directamente del documento original. Las respuestas extractivas se muestran típicamente cerca de la parte superior de las páginas web para proporcionar al usuario final una respuesta breve que sea contextualmente relevante para su consulta. Las respuestas extractivas están disponibles para búsquedas en sitios web y no estructuradas.

Un segmento extractivo es un texto literal que se devuelve con cada resultado de búsqueda. Un segmento extractivo suele ser más extenso que una respuesta extractiva. Los segmentos extractivos se pueden mostrar como respuesta a una consulta y se pueden usar para realizar tareas de post-procesamiento y como entrada para modelos de lenguaje grande para generar respuestas o nuevo texto. Los segmentos extractivos están disponibles para búsquedas no estructuradas.

Para obtener más información sobre los segmentos extractivos y las respuestas extractivas, consulta la [documentación del producto](https://cloud.google.com/generative-ai-app-builder/docs/snippets).

NOTA: Los segmentos extractivos requieren que se habiliten las funciones de la [edición Enterprise](https://cloud.google.com/generative-ai-app-builder/docs/about-advanced-features#enterprise-features).

Al crear una instancia del recuperador, puedes especificar una serie de parámetros que controlan a qué almacén de datos acceder y cómo se procesa una consulta en lenguaje natural, incluidas las configuraciones para respuestas y segmentos extractivos.

### Los parámetros obligatorios son:

- `project_id` - El ID de tu proyecto de Google Cloud.
- `location_id` - La ubicación del almacén de datos.
  - `global` (predeterminado)
  - `us`
  - `eu`

Uno de los siguientes:
- `search_engine_id` - El ID de la aplicación de búsqueda que quieres usar. (Requerido para Blended Search)
- `data_store_id` - El ID del almacén de datos que quieres usar.

Los parámetros `project_id`, `search_engine_id` y `data_store_id` se pueden proporcionar explícitamente en el constructor del recuperador o a través de las variables de entorno - `PROJECT_ID`, `SEARCH_ENGINE_ID` y `DATA_STORE_ID`.

También puedes configurar una serie de parámetros opcionales, incluyendo:

- `max_documents` - El número máximo de documentos utilizados para proporcionar segmentos extractivos o respuestas extractivas
- `get_extractive_answers` - De forma predeterminada, el recuperador está configurado para devolver segmentos extractivos.
  - Establece este campo en `True` para devolver respuestas extractivas. Esto se usa solo cuando `engine_data_type` se establece en `0` (no estructurado)
- `max_extractive_answer_count` - El número máximo de respuestas extractivas devueltas en cada resultado de búsqueda.
  - Como máximo se devolverán 5 respuestas. Esto se usa solo cuando `engine_data_type` se establece en `0` (no estructurado).
- `max_extractive_segment_count` - El número máximo de segmentos extractivos devueltos en cada resultado de búsqueda.
  - Actualmente se devolverá un segmento. Esto se usa solo cuando `engine_data_type` se establece en `0` (no estructurado).
- `filter` - La expresión de filtro para los resultados de búsqueda en función de los metadatos asociados con los documentos en el almacén de datos.
- `query_expansion_condition` - Especificación para determinar en qué condiciones debe ocurrir la expansión de la consulta.
  - `0` - Condición de expansión de consulta no especificada. En este caso, el comportamiento del servidor se establece de forma predeterminada en deshabilitado.
  - `1` - Expansión de consulta deshabilitada. Solo se usa la consulta de búsqueda exacta, incluso si SearchResponse.total_size es cero.
  - `2` - Expansión automática de consultas construida por la API de búsqueda.
- `engine_data_type` - Define el tipo de datos de Vertex AI Search
  - `0` - Datos no estructurados
  - `1` - Datos estructurados
  - `2` - Datos de sitios web
  - `3` - [Búsqueda combinada](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es#multi-data-stores)

### Guía de migración para `GoogleCloudEnterpriseSearchRetriever`

En versiones anteriores, este recuperador se llamaba `GoogleCloudEnterpriseSearchRetriever`.

Para actualizar al nuevo recuperador, realiza los siguientes cambios:

- Cambia la importación de: `from langchain.retrievers import GoogleCloudEnterpriseSearchRetriever` -> `from langchain.retrievers import GoogleVertexAISearchRetriever`.
- Cambia todas las referencias de clase de `GoogleCloudEnterpriseSearchRetriever` -> `GoogleVertexAISearchRetriever`.

### Configura y usa el recuperador para datos **no estructurados** con segmentos extractivos

```python
from langchain_community.retrievers import (
    GoogleVertexAIMultiTurnSearchRetriever,
    GoogleVertexAISearchRetriever,
)

PROJECT_ID = "<YOUR PROJECT ID>"  # Set to your Project ID
LOCATION_ID = "<YOUR LOCATION>"  # Set to your data store location
SEARCH_ENGINE_ID = "<YOUR SEARCH APP ID>"  # Set to your search app ID
DATA_STORE_ID = "<YOUR DATA STORE ID>"  # Set to your data store ID
```

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
)
```

```python
query = "What are Alphabet's Other Bets?"

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configura y usa el recuperador para datos **no estructurados** con respuestas extractivas

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configura y usa el recuperador para datos **estructurados**

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    engine_data_type=1,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configura y usa el recuperador para datos de **sitios web** con indexación avanzada de sitios web

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
    engine_data_type=2,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configura y usa el recuperador para datos **combinados**

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    search_engine_id=SEARCH_ENGINE_ID,
    max_documents=3,
    engine_data_type=3,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configura y usa el recuperador para búsqueda de varios turnos

[Búsqueda con seguimientos](https://cloud.google.com/generative-ai-app-builder/docs/multi-turn-search) se basa en modelos de IA generativa y es diferente de la búsqueda de datos no estructurados regular.

```python
retriever = GoogleVertexAIMultiTurnSearchRetriever(
    project_id=PROJECT_ID, location_id=LOCATION_ID, data_store_id=DATA_STORE_ID
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```
