---
translated: true
---

# cassandra-entomología-rag

Esta plantilla realizará RAG utilizando Apache Cassandra® o Astra DB a través de CQL (`clase de almacén de vectores Cassandra`)

## Configuración del entorno

Para la configuración, necesitará:
- una [base de datos de vectores Astra](https://astra.datastax.com). Debe tener un [token de administrador de base de datos](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure), específicamente la cadena que comienza con `AstraCS:...`.
- [ID de base de datos](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier).
- una **clave API de OpenAI**. (Más información [aquí](https://cassio.org/start_here/#llm-access)))

También puede usar un clúster Cassandra regular. En este caso, proporcione la entrada `USE_CASSANDRA_CLUSTER` como se muestra en `.env.template` y las variables de entorno subsiguientes para especificar cómo conectarse a él.

Los parámetros de conexión y los secretos deben proporcionarse a través de variables de entorno. Consulte `.env.template` para conocer las variables requeridas.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package cassandra-entomology-rag
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add cassandra-entomology-rag
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from cassandra_entomology_rag import chain as cassandra_entomology_rag_chain

add_routes(app, cassandra_entomology_rag_chain, path="/cassandra-entomology-rag")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/cassandra-entomology-rag/playground](http://127.0.0.1:8000/cassandra-entomology-rag/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-entomology-rag")
```

## Referencia

Repositorio independiente con la cadena LangServe: [aquí](https://github.com/hemidactylus/langserve_cassandra_entomology_rag).
