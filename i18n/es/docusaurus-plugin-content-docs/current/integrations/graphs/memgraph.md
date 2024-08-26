---
translated: true
---

# Memgraph

>[Memgraph](https://github.com/memgraph/memgraph) es la base de datos de gráficos de código abierto, compatible con `Neo4j`.
>La base de datos utiliza el lenguaje de consulta de gráficos `Cypher`,
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) es un lenguaje de consulta de gráficos declarativo que permite una consulta de datos expresiva y eficiente en un grafo de propiedades.

Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a una base de datos [Memgraph](https://github.com/memgraph/memgraph).

## Configuración

Para completar este tutorial, necesitarás [Docker](https://www.docker.com/get-started/) y [Python 3.x](https://www.python.org/) instalados.

Asegúrate de tener una instancia de Memgraph en ejecución. Para ejecutar rápidamente la plataforma Memgraph (base de datos Memgraph + biblioteca MAGE + Memgraph Lab) por primera vez, haz lo siguiente:

En Linux/MacOS:

```bash
curl https://install.memgraph.com | sh
```

En Windows:

```bash
iwr https://windows.memgraph.com | iex
```

Ambos comandos ejecutan un script que descarga un archivo Docker Compose a tu sistema, construye y inicia los servicios Docker `memgraph-mage` y `memgraph-lab` en dos contenedores separados.

Lee más sobre el proceso de instalación en [la documentación de Memgraph](https://memgraph.com/docs/getting-started/install-memgraph).

¡Ahora puedes comenzar a jugar con `Memgraph`!

Comienza instalando e importando todos los paquetes necesarios. Utilizaremos el administrador de paquetes llamado [pip](https://pip.pypa.io/en/stable/installation/), junto con la bandera `--user`, para asegurar los permisos adecuados. Si has instalado Python 3.4 o una versión posterior, pip está incluido de forma predeterminada. Puedes instalar todos los paquetes requeridos usando el siguiente comando:

```python
pip install langchain langchain-openai neo4j gqlalchemy --user
```

Puedes ejecutar los bloques de código proporcionados en este cuaderno o usar un archivo Python separado para experimentar con Memgraph y LangChain.

```python
import os

from gqlalchemy import Memgraph
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import MemgraphGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

Estamos utilizando la biblioteca de Python [GQLAlchemy](https://github.com/memgraph/gqlalchemy) para establecer una conexión entre nuestra base de datos Memgraph y el script de Python. También puedes establecer la conexión a una instancia de Memgraph en ejecución con el controlador Neo4j, ya que es compatible con Memgraph. Para ejecutar consultas con GQLAlchemy, podemos configurar una instancia de Memgraph de la siguiente manera:

```python
memgraph = Memgraph(host="127.0.0.1", port=7687)
```

## Poblar la base de datos

Puedes poblar fácilmente tu nueva base de datos vacía usando el lenguaje de consulta Cypher. No te preocupes si no entiendes cada línea aún, puedes aprender Cypher a partir de la documentación [aquí](https://memgraph.com/docs/cypher-manual/). Ejecutar el siguiente script ejecutará una consulta de siembra en la base de datos, dándonos datos sobre un videojuego, incluidos detalles como el editor, las plataformas disponibles y los géneros. Estos datos servirán como base para nuestro trabajo.

```python
# Creating and executing the seeding query
query = """
    MERGE (g:Game {name: "Baldur's Gate 3"})
    WITH g, ["PlayStation 5", "Mac OS", "Windows", "Xbox Series X/S"] AS platforms,
            ["Adventure", "Role-Playing Game", "Strategy"] AS genres
    FOREACH (platform IN platforms |
        MERGE (p:Platform {name: platform})
        MERGE (g)-[:AVAILABLE_ON]->(p)
    )
    FOREACH (genre IN genres |
        MERGE (gn:Genre {name: genre})
        MERGE (g)-[:HAS_GENRE]->(gn)
    )
    MERGE (p:Publisher {name: "Larian Studios"})
    MERGE (g)-[:PUBLISHED_BY]->(p);
"""

memgraph.execute(query)
```

## Actualizar el esquema del gráfico

Estás listo para instanciar el gráfico Memgraph-LangChain utilizando el siguiente script. Esta interfaz nos permitirá consultar nuestra base de datos utilizando LangChain, creando automáticamente el esquema de gráfico requerido para generar consultas Cypher a través de LLM.

```python
graph = MemgraphGraph(url="bolt://localhost:7687", username="", password="")
```

Si es necesario, puedes actualizar manualmente el esquema del gráfico de la siguiente manera.

```python
graph.refresh_schema()
```

Para familiarizarte con los datos y verificar el esquema del gráfico actualizado, puedes imprimirlo utilizando la siguiente declaración.

```python
print(graph.schema)
```

```output
Node properties are the following:
Node name: 'Game', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Platform', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Genre', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Publisher', Node properties: [{'property': 'name', 'type': 'str'}]

Relationship properties are the following:

The relationships are the following:
['(:Game)-[:AVAILABLE_ON]->(:Platform)']
['(:Game)-[:HAS_GENRE]->(:Genre)']
['(:Game)-[:PUBLISHED_BY]->(:Publisher)']
```

## Consultar la base de datos

Para interactuar con la API de OpenAI, debes configurar tu clave API como una variable de entorno utilizando el paquete de Python [os](https://docs.python.org/3/library/os.html). Esto asegura la autorización adecuada para tus solicitudes. Puedes encontrar más información sobre cómo obtener tu clave API [aquí](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key).

```python
os.environ["OPENAI_API_KEY"] = "your-key-here"
```

Debes crear la cadena de gráficos utilizando el siguiente script, que se utilizará en el proceso de preguntas y respuestas basado en tus datos de gráficos. Si bien se establece de forma predeterminada en GPT-3.5-turbo, también podrías considerar experimentar con otros modelos como [GPT-4](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4) para consultas Cypher y resultados notablemente mejorados. Utilizaremos el chat de OpenAI, utilizando la clave que configuraste anteriormente. Estableceremos la temperatura en cero, asegurando respuestas predecibles y consistentes. Además, utilizaremos nuestro gráfico Memgraph-LangChain y estableceremos el parámetro verbose, que de forma predeterminada es False, en True para recibir mensajes más detallados sobre la generación de consultas.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

¡Ahora puedes comenzar a hacer preguntas!

```python
response = chain.run("Which platforms is Baldur's Gate 3 available on?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform)
RETURN p.name
Full Context:
[{'p.name': 'PlayStation 5'}, {'p.name': 'Mac OS'}, {'p.name': 'Windows'}, {'p.name': 'Xbox Series X/S'}]

> Finished chain.
Baldur's Gate 3 is available on PlayStation 5, Mac OS, Windows, and Xbox Series X/S.
```

```python
response = chain.run("Is Baldur's Gate 3 available on Windows?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(:Platform {name: 'Windows'})
RETURN true
Full Context:
[{'true': True}]

> Finished chain.
Yes, Baldur's Gate 3 is available on Windows.
```

## Modificadores de cadena

Para modificar el comportamiento de tu cadena y obtener más contexto o información adicional, puedes modificar los parámetros de la cadena.

#### Devolver resultados de consulta directos

El modificador `return_direct` especifica si se deben devolver los resultados directos de la consulta Cypher ejecutada o la respuesta de lenguaje natural procesada.

```python
# Return the result of querying the graph directly
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
response = chain.run("Which studio published Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:PUBLISHED_BY]->(p:Publisher)
RETURN p.name

> Finished chain.
[{'p.name': 'Larian Studios'}]
```

#### Devolver pasos intermedios de la consulta

El modificador de cadena `return_intermediate_steps` mejora la respuesta devuelta al incluir los pasos intermedios de la consulta además del resultado de la consulta inicial.

```python
# Return all the intermediate steps of query execution
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
response = chain("Is Baldur's Gate 3 an Adventure game?")
print(f"Intermediate steps: {response['intermediate_steps']}")
print(f"Final response: {response['result']}")
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})
RETURN g, genre
Full Context:
[{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]

> Finished chain.
Intermediate steps: [{'query': "MATCH (g:Game {name: 'Baldur\\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})\nRETURN g, genre"}, {'context': [{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]}]
Final response: Yes, Baldur's Gate 3 is an Adventure game.
```

#### Limitar el número de resultados de la consulta

El modificador `top_k` se puede usar cuando deseas restringir el número máximo de resultados de la consulta.

```python
# Limit the maximum number of results returned by query
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
response = chain.run("What genres are associated with Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(g:Genre)
RETURN g.name
Full Context:
[{'g.name': 'Adventure'}, {'g.name': 'Role-Playing Game'}]

> Finished chain.
Baldur's Gate 3 is associated with the genres Adventure and Role-Playing Game.
```

# Consultas avanzadas

A medida que la complejidad de tu solución crece, es posible que te encuentres con diferentes casos de uso que requieren un manejo cuidadoso. Asegurar la escalabilidad de tu aplicación es esencial para mantener un flujo de usuario suave sin problemas.

Vamos a instanciar nuestra cadena una vez más e intentar hacer algunas preguntas que los usuarios podrían hacer potencialmente.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PS5'})
RETURN g.name, p.name
Full Context:
[]

> Finished chain.
I'm sorry, but I don't have the information to answer your question.
```

La consulta Cypher generada se ve bien, pero no recibimos ninguna información en respuesta. Esto ilustra un desafío común cuando se trabaja con LLM: la falta de alineación entre la forma en que los usuarios formulan las consultas y la forma en que se almacenan los datos. En este caso, la diferencia entre la percepción del usuario y el almacenamiento de datos real puede causar desajustes. El refinamiento de prompts, el proceso de perfeccionar los prompts del modelo para comprender mejor estas distinciones, es una solución eficiente que aborda este problema. A través del refinamiento de prompts, el modelo adquiere una mayor competencia para generar consultas precisas y pertinentes, lo que lleva a la recuperación exitosa de los datos deseados.

### Refinamiento de prompts

Para abordar esto, podemos ajustar el prompt Cypher inicial de la cadena de QA. Esto implica agregar orientación al LLM sobre cómo los usuarios pueden hacer referencia a plataformas específicas, como PS5 en nuestro caso. Logramos esto usando la plantilla de prompts de LangChain [PromptTemplate](/docs/modules/model_io/prompts/), creando un prompt inicial modificado. Este prompt modificado se suministra entonces como argumento a nuestra instancia refinada de Memgraph-LangChain.

```python
CYPHER_GENERATION_TEMPLATE = """
Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
If the user asks about PS5, Play Station 5 or PS 5, that is the platform called PlayStation 5.

The question is:
{question}
"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)
```

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    cypher_prompt=CYPHER_GENERATION_PROMPT,
    graph=graph,
    verbose=True,
    model_name="gpt-3.5-turbo",
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PlayStation 5'})
RETURN g.name, p.name
Full Context:
[{'g.name': "Baldur's Gate 3", 'p.name': 'PlayStation 5'}]

> Finished chain.
Yes, Baldur's Gate 3 is available on PlayStation 5.
```

Ahora, con el prompt Cypher inicial revisado que incluye orientación sobre la nomenclatura de la plataforma, estamos obteniendo resultados precisos y relevantes que se alinean más estrechamente con las consultas de los usuarios.

Este enfoque permite una mayor mejora de tu cadena de QA. Puedes integrar fácilmente datos de refinamiento de prompts adicionales en tu cadena, mejorando así la experiencia general del usuario de tu aplicación.
