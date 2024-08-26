---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) es un motor de búsqueda y análisis distribuido y RESTful, capaz de realizar búsquedas tanto vectoriales como léxicas. Está construido sobre la biblioteca Apache Lucene.

Este cuaderno muestra cómo usar la funcionalidad de historial de mensajes de chat con `Elasticsearch`.

## Configurar Elasticsearch

Hay dos formas principales de configurar una instancia de Elasticsearch:

1. **Elastic Cloud.** Elastic Cloud es un servicio de Elasticsearch administrado. Regístrese para obtener una [prueba gratuita](https://cloud.elastic.co/registration?storm=langchain-notebook).

2. **Instalación local de Elasticsearch.** Comience con Elasticsearch ejecutándolo localmente. La forma más sencilla es usar la imagen oficial de Docker de Elasticsearch. Consulte la [documentación de Docker de Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) para obtener más información.

## Instalar dependencias

```python
%pip install --upgrade --quiet  elasticsearch langchain
```

## Autenticación

### Cómo obtener una contraseña para el usuario "elastic" predeterminado

Para obtener la contraseña de Elastic Cloud para el usuario "elastic" predeterminado:
1. Inicie sesión en la [consola de Elastic Cloud](https://cloud.elastic.co)
2. Vaya a "Seguridad" > "Usuarios"
3. Ubique al usuario "elastic" y haga clic en "Editar"
4. Haga clic en "Restablecer contraseña"
5. Siga los pasos para restablecer la contraseña

### Usar el nombre de usuario/contraseña

```python
es_username = os.environ.get("ES_USERNAME", "elastic")
es_password = os.environ.get("ES_PASSWORD", "change me...")

history = ElasticsearchChatMessageHistory(
    es_url=es_url,
    es_user=es_username,
    es_password=es_password,
    index="test-history",
    session_id="test-session"
)
```

### Cómo obtener una clave API

Para obtener una clave API:
1. Inicie sesión en la [consola de Elastic Cloud](https://cloud.elastic.co)
2. Abra `Kibana` y vaya a Administración del stack > Claves API
3. Haga clic en "Crear clave API"
4. Ingrese un nombre para la clave API y haga clic en "Crear"

### Usar la clave API

```python
es_api_key = os.environ.get("ES_API_KEY")

history = ElasticsearchChatMessageHistory(
    es_api_key=es_api_key,
    index="test-history",
    session_id="test-session"
)
```

## Inicializar el cliente de Elasticsearch y el historial de mensajes de chat

```python
import os

from langchain_community.chat_message_histories import (
    ElasticsearchChatMessageHistory,
)

es_url = os.environ.get("ES_URL", "http://localhost:9200")

# If using Elastic Cloud:
# es_cloud_id = os.environ.get("ES_CLOUD_ID")

# Note: see Authentication section for various authentication methods

history = ElasticsearchChatMessageHistory(
    es_url=es_url, index="test-history", session_id="test-session"
)
```

## Usar el historial de mensajes de chat

```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```output
indexing message content='hi!' additional_kwargs={} example=False
indexing message content='whats up?' additional_kwargs={} example=False
```
