---
translated: true
---

# neo4j-cypher-ft

Esta plantilla permite interactuar con una base de datos de gráficos Neo4j utilizando lenguaje natural, aprovechando el LLM de OpenAI.

Su función principal es convertir preguntas en lenguaje natural en consultas Cypher (el lenguaje utilizado para consultar bases de datos Neo4j), ejecutar estas consultas y proporcionar respuestas en lenguaje natural basadas en los resultados de la consulta.

El paquete utiliza un índice de texto completo para el mapeo eficiente de valores de texto a entradas de la base de datos, mejorando así la generación de declaraciones Cypher precisas.

En el ejemplo proporcionado, el índice de texto completo se utiliza para asignar nombres de personas y películas de la consulta del usuario a las entradas correspondientes de la base de datos.

## Configuración del entorno

Las siguientes variables de entorno deben estar configuradas:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

Además, si desea poblar la base de datos con algunos datos de ejemplo, puede ejecutar `python ingest.py`.
Este script poblará la base de datos con datos de muestra de películas y creará un índice de texto completo llamado `entity`, que se utiliza para asignar personas y películas de la entrada del usuario a los valores de la base de datos para la generación precisa de declaraciones Cypher.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package neo4j-cypher-ft
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add neo4j-cypher-ft
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from neo4j_cypher_ft import chain as neo4j_cypher_ft_chain

add_routes(app, neo4j_cypher_ft_chain, path="/neo4j-cypher-ft")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/neo4j-cypher-ft/playground](http://127.0.0.1:8000/neo4j-cypher-ft/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher-ft")
```
