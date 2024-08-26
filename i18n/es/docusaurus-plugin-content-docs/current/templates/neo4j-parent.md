---
translated: true
---

# neo4j-parent

Esta plantilla permite equilibrar los incrustados precisos y la retención de contexto al dividir los documentos en trozos más pequeños y recuperar su información de texto original o más grande.

Usando un índice de vector Neo4j, el paquete consulta los nodos secundarios utilizando la búsqueda de similitud de vectores y recupera el texto correspondiente del padre definiendo un parámetro `retrieval_query` apropiado.

## Configuración del entorno

Necesitas definir las siguientes variables de entorno

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Poblar con datos

Si deseas poblar la base de datos con algunos datos de ejemplo, puedes ejecutar `python ingest.py`.
El script procesa y almacena secciones del texto del archivo `dune.txt` en una base de datos de gráficos Neo4j.
Primero, el texto se divide en trozos más grandes ("padres") y luego se subdivide aún más en trozos más pequeños ("hijos"), donde tanto los trozos de padres como de hijos se superponen ligeramente para mantener el contexto.
Después de almacenar estos trozos en la base de datos, se calculan los incrustados para los nodos secundarios utilizando los incrustados de OpenAI y se almacenan de vuelta en el gráfico para su futura recuperación o análisis.
Además, se crea un índice de vector llamado `retrieval` para una consulta eficiente de estos incrustados.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package neo4j-parent
```

Si deseas agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add neo4j-parent
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from neo4j_parent import chain as neo4j_parent_chain

add_routes(app, neo4j_parent_chain, path="/neo4j-parent")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección

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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/neo4j-parent/playground](http://127.0.0.1:8000/neo4j-parent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-parent")
```
