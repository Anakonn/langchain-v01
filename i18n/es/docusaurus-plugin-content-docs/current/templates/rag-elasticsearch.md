---
translated: true
---

# rag-elasticsearch

Esta plantilla realiza RAG utilizando [Elasticsearch](https://python.langchain.com/docs/integrations/vectorstores/elasticsearch).

Se basa en el transformador de oraciones `MiniLM-L6-v2` para incrustar pasajes y preguntas.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Para conectarse a tu instancia de Elasticsearch, usa las siguientes variables de entorno:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

Para el desarrollo local con Docker, usa:

```bash
export ES_URL="http://localhost:9200"
```

Y ejecuta una instancia de Elasticsearch en Docker con

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-elasticsearch
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-elasticsearch
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_elasticsearch import chain as rag_elasticsearch_chain

add_routes(app, rag_elasticsearch_chain, path="/rag-elasticsearch")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-elasticsearch/playground](http://127.0.0.1:8000/rag-elasticsearch/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-elasticsearch")
```

Para cargar los documentos ficticios del lugar de trabajo, ejecuta el siguiente comando desde la raíz de este repositorio:

```bash
python ingest.py
```

Sin embargo, puedes elegir entre una gran cantidad de cargadores de documentos [aquí](https://python.langchain.com/docs/integrations/document_loaders).
