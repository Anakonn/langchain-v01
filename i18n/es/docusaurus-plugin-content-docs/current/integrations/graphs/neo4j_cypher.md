---
translated: true
---

# Neo4j

>[Neo4j](https://neo4j.com/docs/getting-started/) es un sistema de gestión de bases de datos de gráficos desarrollado por `Neo4j, Inc`.

>Los elementos de datos que `Neo4j` almacena son nodos, bordes que los conectan y atributos de nodos y bordes. Descrito por sus desarrolladores como una base de datos transaccional compatible con ACID con almacenamiento y procesamiento nativos de gráficos, `Neo4j` está disponible en una edición "comunitaria" no de código abierto con una licencia de modificación de la Licencia Pública General de GNU, con extensiones de copia de seguridad en línea y alta disponibilidad con licencia bajo una licencia comercial de código cerrado. Neo también otorga licencias de `Neo4j` con estas extensiones bajo términos comerciales de código cerrado.

>Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a una base de datos de gráficos que se puede consultar con el lenguaje de consulta `Cypher`.

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) es un lenguaje de consulta de gráficos declarativo que permite una consulta de datos expresiva y eficiente en un gráfico de propiedades.

## Configuración

Deberá tener una instancia de `Neo4j` en ejecución. Una opción es crear una [instancia de base de datos gratuita de Neo4j en su servicio en la nube Aura](https://neo4j.com/cloud/platform/aura-graph-database/). También puede ejecutar la base de datos localmente usando la [aplicación Neo4j Desktop](https://neo4j.com/download/) o ejecutando un contenedor docker.
Puede ejecutar un contenedor docker local ejecutando el siguiente script:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Si está usando el contenedor docker, debe esperar unos segundos para que la base de datos se inicie.

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
```

```python
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
```

## Sembrar la base de datos

Suponiendo que su base de datos esté vacía, puede poblarla usando el lenguaje de consulta Cypher. La siguiente declaración Cypher es idempotente, lo que significa que la información de la base de datos será la misma si la ejecuta una o varias veces.

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun", runtime: 120})
WITH m
UNWIND ["Tom Cruise", "Val Kilmer", "Anthony Edwards", "Meg Ryan"] AS actor
MERGE (a:Actor {name:actor})
MERGE (a)-[:ACTED_IN]->(m)
"""
)
```

```output
[]
```

## Actualizar la información del esquema del gráfico

Si el esquema de la base de datos cambia, puede actualizar la información del esquema necesaria para generar declaraciones Cypher.

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

```output
Node properties:
Movie {runtime: INTEGER, name: STRING}
Actor {name: STRING}
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## Información de esquema mejorada

Elegir la versión mejorada del esquema permite que el sistema analice automáticamente los valores de ejemplo dentro de las bases de datos y calcule algunas métricas de distribución. Por ejemplo, si una propiedad de nodo tiene menos de 10 valores distintos, devolvemos todos los posibles valores en el esquema. De lo contrario, devuelve solo un valor de ejemplo por propiedad de nodo y relación.

```python
enhanced_graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    enhanced_schema=True,
)
print(enhanced_graph.schema)
```

```output
Node properties:
- **Movie**
  - `runtime: INTEGER` Min: 120, Max: 120
  - `name: STRING` Available options: ['Top Gun']
- **Actor**
  - `name: STRING` Available options: ['Tom Cruise', 'Val Kilmer', 'Anthony Edwards', 'Meg Ryan']
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## Consultar el gráfico

Ahora podemos usar la cadena de consulta Cypher QA para hacer preguntas sobre el gráfico

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```

## Limitar el número de resultados

Puede limitar el número de resultados de la cadena Cypher QA usando el parámetro `top_k`.
El valor predeterminado es 10.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan played in Top Gun.'}
```

## Devolver resultados intermedios

Puede devolver pasos intermedios de la cadena Cypher QA usando el parámetro `return_intermediate_steps`

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain.invoke({"query": "Who played in Top Gun?"})
print(f"Intermediate steps: {result['intermediate_steps']}")
print(f"Final answer: {result['result']}")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}]}]
Final answer: Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.
```

## Devolver resultados directos

Puede devolver resultados directos de la cadena Cypher QA usando el parámetro `return_direct`

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'a.name': 'Anthony Edwards'},
  {'a.name': 'Meg Ryan'},
  {'a.name': 'Val Kilmer'},
  {'a.name': 'Tom Cruise'}]}
```

## Agregar ejemplos en el aviso de generación de Cypher

Puede definir la declaración Cypher que desea que el LLM genere para preguntas particulares

```python
from langchain_core.prompts.prompt import PromptTemplate

CYPHER_GENERATION_TEMPLATE = """Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Examples: Here are a few examples of generated Cypher statements for particular questions:
# How many people played in Top Gun?
MATCH (m:Movie {{title:"Top Gun"}})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors

The question is:
{question}"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)

chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    graph=graph,
    verbose=True,
    cypher_prompt=CYPHER_GENERATION_PROMPT,
)
```

```python
chain.invoke({"query": "How many people played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberOfActors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': 'There were 4 actors who played in Top Gun.'}
```

## Usar LLM separados para la generación de Cypher y respuesta

Puede usar los parámetros `cypher_llm` y `qa_llm` para definir diferentes llm

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, and Tom Cruise played in Top Gun.'}
```

## Ignorar tipos de nodos y relaciones especificados

Puede usar `include_types` o `exclude_types` para ignorar partes del esquema del gráfico al generar declaraciones Cypher.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
    exclude_types=["Movie"],
)
```

```python
# Inspect graph schema
print(chain.graph_schema)
```

```output
Node properties are the following:
Actor {name: STRING}
Relationship properties are the following:

The relationships are the following:
```

## Validar las declaraciones Cypher generadas

Puede usar el parámetro `validate_cypher` para validar y corregir las direcciones de las relaciones en las declaraciones Cypher generadas

```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```
