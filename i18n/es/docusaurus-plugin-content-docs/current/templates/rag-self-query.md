---
translated: true
---

# rag-self-query

Esta plantilla realiza RAG utilizando la técnica de recuperación de autoconsuita. La idea principal es permitir que un LLM convierta consultas no estructuradas en consultas estructuradas. Consulte la [documentación para obtener más información sobre cómo funciona esto](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query).

## Configuración del entorno

En esta plantilla utilizaremos modelos de OpenAI y un almacén de vectores de Elasticsearch, pero el enfoque se generaliza a todos los LLM/ChatModels y [una serie de almacenes de vectores](https://python.langchain.com/docs/integrations/retrievers/self_query/).

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Para conectarse a su instancia de Elasticsearch, utilice las siguientes variables de entorno:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

Para el desarrollo local con Docker, utilice:

```bash
export ES_URL = "http://localhost:9200"
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## Uso

Para utilizar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-self-query
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-self-query
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_self_query import chain

add_routes(app, chain, path="/rag-elasticsearch")
```

Para poblar el almacén de vectores con los datos de muestra, desde la raíz del directorio ejecute:

```bash
python ingest.py
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

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

runnable = RemoteRunnable("http://localhost:8000/rag-self-query")
```
