---
translated: true
---

# rag-opensearch

Esta plantilla realiza RAG utilizando [OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch).

## Configuración del entorno

Establezca las siguientes variables de entorno.

- `OPENAI_API_KEY` - Para acceder a los Embeddings y Modelos de OpenAI.

Y opcionalmente establezca los de OpenSearch si no se están utilizando los valores predeterminados:

- `OPENSEARCH_URL` - URL de la instancia de OpenSearch alojada
- `OPENSEARCH_USERNAME` - Nombre de usuario para la instancia de OpenSearch
- `OPENSEARCH_PASSWORD` - Contraseña para la instancia de OpenSearch
- `OPENSEARCH_INDEX_NAME` - Nombre del índice

Para ejecutar la instancia predeterminada de OpenSeach en docker, puede usar el comando

```shell
docker run -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" --name opensearch-node -d opensearchproject/opensearch:latest
```

Nota: Para cargar un índice ficticio llamado `langchain-test` con documentos ficticios, ejecute `python dummy_index_setup.py` en el paquete

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-opensearch
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-opensearch
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_opensearch import chain as rag_opensearch_chain

add_routes(app, rag_opensearch_chain, path="/rag-opensearch")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección

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
Podemos acceder al playground en [http://127.0.0.1:8000/rag-opensearch/playground](http://127.0.0.1:8000/rag-opensearch/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-opensearch")
```
