---
translated: true
---

# neo4j_cypher

Esta plantilla permite interactuar con una base de datos de gráficos Neo4j en lenguaje natural, utilizando un LLM de OpenAI.

Transforma una pregunta en lenguaje natural en una consulta Cypher (utilizada para obtener datos de bases de datos Neo4j), ejecuta la consulta y proporciona una respuesta en lenguaje natural basada en los resultados de la consulta.

[](https://medium.com/neo4j/langchain-cypher-search-tips-tricks-f7c9e9abca4d)

## Configuración del entorno

Define las siguientes variables de entorno:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Configuración de la base de datos Neo4j

Hay varias formas de configurar una base de datos Neo4j.

### Neo4j Aura

Neo4j AuraDB es un servicio de base de datos de gráficos en la nube totalmente administrado.
Crea una instancia gratuita en [Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve).
Cuando inicies una instancia de base de datos gratuita, recibirás las credenciales para acceder a la base de datos.

## Poblar con datos

Si deseas poblar la base de datos con algunos datos de ejemplo, puedes ejecutar `python ingest.py`.
Este script poblará la base de datos con datos de muestra de películas.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package neo4j-cypher
```

Si deseas agregar esto a un proyecto existente, puedes ejecutar:

```shell
langchain app add neo4j-cypher
```

Y agregar el siguiente código a tu archivo `server.py`:

```python
from neo4j_cypher import chain as neo4j_cypher_chain

add_routes(app, neo4j_cypher_chain, path="/neo4j-cypher")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/neo4j_cypher/playground](http://127.0.0.1:8000/neo4j_cypher/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher")
```
