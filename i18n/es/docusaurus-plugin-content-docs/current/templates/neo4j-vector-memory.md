---
translated: true
---

Aquí está la traducción al español:

---
translated: false
---

# neo4j-vector-memory

Esta plantilla le permite integrar un LLM con un sistema de recuperación basado en vectores utilizando Neo4j como almacén de vectores.
Además, utiliza las capacidades de gráficos de la base de datos Neo4j para almacenar y recuperar el historial de diálogo de la sesión de un usuario específico.
Tener el historial de diálogo almacenado como un gráfico permite flujos de conversación fluidos, pero también le da la capacidad de analizar el comportamiento del usuario y la recuperación de fragmentos de texto a través de análisis de gráficos.

## Configuración del entorno

Debe definir las siguientes variables de entorno

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Poblar con datos

Si desea poblar la base de datos con algunos datos de ejemplo, puede ejecutar `python ingest.py`.
El script procesa y almacena secciones del texto del archivo `dune.txt` en una base de datos de gráficos Neo4j.
Además, se crea un índice de vectores llamado `dune` para una consulta eficiente de estos incrustaciones.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package neo4j-vector-memory
```

Si desea agregarlo a un proyecto existente, puede ejecutar:

```shell
langchain app add neo4j-vector-memory
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from neo4j_vector_memory import chain as neo4j_vector_memory_chain

add_routes(app, neo4j_vector_memory_chain, path="/neo4j-vector-memory")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
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
Podemos acceder al playground en [http://127.0.0.1:8000/neo4j-vector-memory/playground](http://127.0.0.1:8000/neo4j-parent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-vector-memory")
```
