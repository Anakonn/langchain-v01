---
translated: true
---

# Apache AGE

>[Apache AGE](https://age.apache.org/) es una extensión de PostgreSQL que proporciona funcionalidad de base de datos de gráficos. AGE es un acrónimo de A Graph Extension, y se inspira en el fork de Bitnine de PostgreSQL 10, AgensGraph, que es una base de datos multimodelo. El objetivo del proyecto es crear un único almacenamiento que pueda manejar tanto datos del modelo relacional como del modelo de gráficos, para que los usuarios puedan usar SQL ANSI estándar junto con openCypher, el lenguaje de consulta de gráficos. Los elementos de datos que `Apache AGE` almacena son nodos, bordes que los conectan y atributos de nodos y bordes.

>Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a una base de datos de gráficos que se puede consultar con el lenguaje de consulta `Cypher`.

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) es un lenguaje de consulta de gráficos declarativo que permite una consulta de datos expresiva y eficiente en un grafo de propiedades.

## Configuración

Necesitará tener una instancia de `Postgre` en ejecución con la extensión AGE instalada. Una opción para probar es ejecutar un contenedor de Docker usando la imagen oficial de AGE Docker.
Puede ejecutar un contenedor de Docker local ejecutando el siguiente script:

```bash
docker run \
    --name age  \
    -p 5432:5432 \
    -e POSTGRES_USER=postgresUser \
    -e POSTGRES_PASSWORD=postgresPW \
    -e POSTGRES_DB=postgresDB \
    -d \
    apache/age
```

Puede encontrar instrucciones adicionales sobre cómo ejecutarlo en Docker [aquí](https://hub.docker.com/r/apache/age).

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs.age_graph import AGEGraph
from langchain_openai import ChatOpenAI
```

```python
conf = {
    "database": "postgresDB",
    "user": "postgresUser",
    "password": "postgresPW",
    "host": "localhost",
    "port": 5432,
}

graph = AGEGraph(graph_name="age_test", conf=conf)
```

## Sembrar la base de datos

Suponiendo que su base de datos esté vacía, puede poblarla usando el lenguaje de consulta Cypher. La siguiente declaración Cypher es idempotente, lo que significa que la información de la base de datos será la misma si la ejecuta una o varias veces.

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun"})
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

        Node properties are the following:
        [{'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Actor'}, {'properties': [{'property': 'property_a', 'type': 'STRING'}], 'labels': 'LabelA'}, {'properties': [], 'labels': 'LabelB'}, {'properties': [], 'labels': 'LabelC'}, {'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Movie'}]
        Relationship properties are the following:
        [{'properties': [], 'type': 'ACTED_IN'}, {'properties': [{'property': 'rel_prop', 'type': 'STRING'}], 'type': 'REL_TYPE'}]
        The relationships are the following:
        ['(:`Actor`)-[:`ACTED_IN`]->(:`Movie`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelB`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelC`)']
```

## Consultar el gráfico

Ahora podemos usar la cadena de consulta y respuesta de Cypher para hacer preguntas sobre el gráfico

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
```

## Limitar el número de resultados

Puede limitar el número de resultados de la cadena de consulta y respuesta de Cypher usando el parámetro `top_k`.
El valor predeterminado es 10.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer played in Top Gun.'}
```

## Devolver resultados intermedios

Puede devolver pasos intermedios de la cadena de consulta y respuesta de Cypher usando el parámetro `return_intermediate_steps`

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain("Who played in Top Gun?")
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
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}]}]
Final answer: Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.
```

## Devolver resultados directos

Puede devolver resultados directos de la cadena de consulta y respuesta de Cypher usando el parámetro `return_direct`

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'name': 'Tom Cruise'},
  {'name': 'Val Kilmer'},
  {'name': 'Anthony Edwards'},
  {'name': 'Meg Ryan'}]}
```

## Agregar ejemplos en el prompt de generación de Cypher

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
chain.invoke("How many people played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-(:Actor)
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberofactors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': "I don't know the answer."}
```

## Usar LLM separados para la generación de Cypher y respuesta

Puede usar los parámetros `cypher_llm` y `qa_llm` para definir diferentes LLM

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
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
Actor {name: STRING},LabelA {property_a: STRING},LabelB {},LabelC {}
Relationship properties are the following:
ACTED_IN {},REL_TYPE {rel_prop: STRING}
The relationships are the following:
(:LabelA)-[:REL_TYPE]->(:LabelB),(:LabelA)-[:REL_TYPE]->(:LabelC)
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
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
```
