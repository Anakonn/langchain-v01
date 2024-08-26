---
translated: true
---

# Diffbot

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/graph/diffbot_graphtransformer.ipynb)

>[Diffbot](https://docs.diffbot.com/docs/getting-started-with-diffbot) es un conjunto de productos que facilitan la integración y la investigación de datos en la web.
>
>[The Diffbot Knowledge Graph](https://docs.diffbot.com/docs/getting-started-with-diffbot-knowledge-graph) es una base de datos de grafos de actualización automática de la web pública.

## Caso de uso

Los datos de texto a menudo contienen relaciones e ideas ricas utilizadas para diversos análisis, motores de recomendación o aplicaciones de gestión del conocimiento.

`Diffbot's NLP API` permite la extracción de entidades, relaciones y significado semántico de datos de texto no estructurados.

Al combinar `Diffbot's NLP API` con `Neo4j`, una base de datos de grafos, puede crear estructuras de grafos dinámicas y potentes basadas en la información extraída del texto. Estas estructuras de grafos son completamente consultables y se pueden integrar en varias aplicaciones.

Esta combinación permite casos de uso como:

* Construir grafos de conocimiento a partir de documentos de texto, sitios web o feeds de redes sociales.
* Generar recomendaciones basadas en relaciones semánticas en los datos.
* Crear funciones de búsqueda avanzadas que entiendan las relaciones entre entidades.
* Construir paneles de análisis que permitan a los usuarios explorar las relaciones ocultas en los datos.

## Resumen

LangChain proporciona herramientas para interactuar con bases de datos de grafos:

1. `Construir grafos de conocimiento a partir de texto` utilizando transformadores de grafos e integraciones de almacenamiento
2. `Consultar una base de datos de grafos` utilizando cadenas para la creación y ejecución de consultas
3. `Interactuar con una base de datos de grafos` utilizando agentes para consultas robustas y flexibles

## Configuración

Primero, obtén los paquetes necesarios y establece las variables de entorno:

```python
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai neo4j wikipedia
```

### Servicio Diffbot NLP

El servicio `Diffbot's NLP` es una herramienta para extraer entidades, relaciones y contexto semántico de datos de texto no estructurados.
Esta información extraída se puede utilizar para construir un grafo de conocimiento.
Para utilizar su servicio, deberá obtener una clave API de [Diffbot](https://www.diffbot.com/products/natural-language/).

```python
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_api_key = "DIFFBOT_API_KEY"
diffbot_nlp = DiffbotGraphTransformer(diffbot_api_key=diffbot_api_key)
```

Este código recupera los artículos de Wikipedia sobre "Warren Buffett" y luego utiliza `DiffbotGraphTransformer` para extraer entidades y relaciones.
El `DiffbotGraphTransformer` genera un `GraphDocument` estructurado, que se puede utilizar para poblar una base de datos de grafos.
Tenga en cuenta que se evita el fragmentación de texto debido al [límite de caracteres por solicitud de API](https://docs.diffbot.com/reference/introduction-to-natural-language-api) de Diffbot.

```python
from langchain_community.document_loaders import WikipediaLoader

query = "Warren Buffett"
raw_documents = WikipediaLoader(query=query).load()
graph_documents = diffbot_nlp.convert_to_graph_documents(raw_documents)
```

## Cargar los datos en un grafo de conocimiento

Necesitará tener una instancia de Neo4j en ejecución. Una opción es crear una [instancia de base de datos Neo4j gratuita en su servicio en la nube Aura](https://neo4j.com/cloud/platform/aura-graph-database/). También puede ejecutar la base de datos localmente utilizando la [aplicación Neo4j Desktop](https://neo4j.com/download/) o ejecutando un contenedor docker. Puede ejecutar un contenedor docker local ejecutando el siguiente script:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/pleaseletmein \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Si está utilizando el contenedor docker, debe esperar unos segundos para que la base de datos se inicie.

```python
from langchain_community.graphs import Neo4jGraph

url = "bolt://localhost:7687"
username = "neo4j"
password = "pleaseletmein"

graph = Neo4jGraph(url=url, username=username, password=password)
```

Los `GraphDocuments` se pueden cargar en un grafo de conocimiento utilizando el método `add_graph_documents`.

```python
graph.add_graph_documents(graph_documents)
```

## Actualizar la información del esquema del grafo

Si el esquema de la base de datos cambia, puede actualizar la información del esquema necesaria para generar las instrucciones Cypher

```python
graph.refresh_schema()
```

## Consultar el grafo

Ahora podemos utilizar la cadena de consulta de grafos de Cypher para hacer preguntas sobre el grafo. Se recomienda utilizar **gpt-4** para construir consultas Cypher para obtener la mejor experiencia.

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

chain = GraphCypherQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model_name="gpt-4"),
    qa_llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
)
```

```python
chain.run("Which university did Warren Buffett attend?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: "Warren Buffett"})-[:EDUCATED_AT]->(o:Organization)
RETURN o.name[0m
Full Context:
[32;1m[1;3m[{'o.name': 'New York Institute of Finance'}, {'o.name': 'Alice Deal Junior High School'}, {'o.name': 'Woodrow Wilson High School'}, {'o.name': 'University of Nebraska'}][0m

[1m> Finished chain.[0m
```

```output
'Warren Buffett attended the University of Nebraska.'
```

```python
chain.run("Who is or was working at Berkshire Hathaway?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[r:EMPLOYEE_OR_MEMBER_OF]->(o:Organization) WHERE o.name = 'Berkshire Hathaway' RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Charlie Munger'}, {'p.name': 'Oliver Chace'}, {'p.name': 'Howard Buffett'}, {'p.name': 'Howard'}, {'p.name': 'Susan Buffett'}, {'p.name': 'Warren Buffett'}][0m

[1m> Finished chain.[0m
```

```output
'Charlie Munger, Oliver Chace, Howard Buffett, Susan Buffett, and Warren Buffett are or were working at Berkshire Hathaway.'
```
