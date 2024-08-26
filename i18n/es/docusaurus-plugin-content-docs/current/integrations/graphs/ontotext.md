---
translated: true
---

# Ontotext GraphDB

>[Ontotext GraphDB](https://graphdb.ontotext.com/) es una base de datos de grafos y una herramienta de descubrimiento de conocimiento que cumple con [RDF](https://www.w3.org/RDF/) y [SPARQL](https://www.w3.org/TR/sparql11-query/).

>Este cuaderno muestra cómo usar LLM para proporcionar consultas en lenguaje natural (NLQ a SPARQL, también llamado `text2sparql`) para `Ontotext GraphDB`.

## Funcionalidades de GraphDB LLM

`GraphDB` admite algunas funcionalidades de integración de LLM como se describe [aquí](https://github.com/w3c/sparql-dev/issues/193):

[gpt-queries](https://graphdb.ontotext.com/documentation/10.5/gpt-queries.html)

* predicados mágicos para preguntar a un LLM por texto, lista o tabla usando datos de tu grafo de conocimiento (KG)
* explicación de consulta
* explicación, resumen, reformulación y traducción de resultados

[retrieval-graphdb-connector](https://graphdb.ontotext.com/documentation/10.5/retrieval-graphdb-connector.html)

* Indexación de entidades de KG en una base de datos de vectores
* Admite cualquier algoritmo de incrustación de texto y base de datos de vectores
* Utiliza el mismo lenguaje de conector potente (indexación) que GraphDB usa para Elastic, Solr, Lucene
* Sincronización automática de cambios en datos RDF con el índice de entidades de KG
* Admite objetos anidados (sin soporte de UI en la versión 10.5 de GraphDB)
* Serializa las entidades de KG a texto como este (por ejemplo, para un conjunto de datos de Wines):

```text
Franvino:
- is a RedWine.
- made from grape Merlo.
- made from grape Cabernet Franc.
- has sugar dry.
- has year 2012.
```

[talk-to-graph](https://graphdb.ontotext.com/documentation/10.5/talk-to-graph.html)

* Un chatbot simple que usa un índice de entidades de KG definido

Para este tutorial, no usaremos la integración de LLM de GraphDB, sino la generación de `SPARQL` a partir de NLQ. Usaremos la ontología y el conjunto de datos de la API de Star Wars (`SWAPI`) que puedes examinar [aquí](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo/blob/main/starwars-data.trig).

## Configuración

Necesitas una instancia de GraphDB en ejecución. Este tutorial muestra cómo ejecutar la base de datos localmente usando la [imagen de Docker de GraphDB](https://hub.docker.com/r/ontotext/graphdb). Proporciona un conjunto de composición de Docker, que llena GraphDB con el conjunto de datos de Star Wars. Todos los archivos necesarios, incluido este cuaderno, se pueden descargar del [repositorio de GitHub langchain-graphdb-qa-chain-demo](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo).

* Instala [Docker](https://docs.docker.com/get-docker/). Este tutorial se creó usando la versión 24.0.7 de Docker, que incluye [Docker Compose](https://docs.docker.com/compose/). Para versiones anteriores de Docker, es posible que tengas que instalar Docker Compose por separado.
* Clona [el repositorio de GitHub langchain-graphdb-qa-chain-demo](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo) en una carpeta local de tu máquina.
* Inicia GraphDB con el siguiente script ejecutado desde la misma carpeta

```bash
docker build --tag graphdb .
docker compose up -d graphdb
```

  Debes esperar unos segundos para que la base de datos se inicie en `http://localhost:7200/`. El conjunto de datos de Star Wars `starwars-data.trig` se carga automáticamente en el repositorio `langchain`. El punto final SPARQL local `http://localhost:7200/repositories/langchain` se puede usar para ejecutar consultas. También puedes abrir el GraphDB Workbench desde tu navegador web favorito `http://localhost:7200/sparql` donde puedes hacer consultas de forma interactiva.
* Configura el entorno de trabajo

Si usas `conda`, crea y activa un nuevo entorno conda (por ejemplo, `conda create -n graph_ontotext_graphdb_qa python=3.9.18`).

Instala las siguientes bibliotecas:

```bash
pip install jupyter==1.0.0
pip install openai==1.6.1
pip install rdflib==7.0.0
pip install langchain-openai==0.0.2
pip install langchain>=0.1.5
```

Ejecuta Jupyter con

```bash
jupyter notebook
```

## Especificación de la ontología

Para que el LLM pueda generar SPARQL, necesita conocer el esquema del grafo de conocimiento (la ontología). Se puede proporcionar utilizando uno de los dos parámetros de la clase `OntotextGraphDBGraph`:

* `query_ontology`: una consulta `CONSTRUCT` que se ejecuta en el punto final SPARQL y devuelve las declaraciones del esquema del KG. Recomendamos que almacenes la ontología en su propio grafo con nombre, lo que facilitará obtener solo las declaraciones relevantes (como en el ejemplo a continuación). No se admiten consultas `DESCRIBE`, porque `DESCRIBE` devuelve la Descripción Acotada Concisa Simétrica (SCBD), es decir, también los enlaces de clase entrantes. En el caso de gráficos grandes con un millón de instancias, esto no es eficiente. Consulta https://github.com/eclipse-rdf4j/rdf4j/issues/4857
* `local_file`: un archivo de ontología RDF local. Los formatos RDF admitidos son `Turtle`, `RDF/XML`, `JSON-LD`, `N-Triples`, `Notation-3`, `Trig`, `Trix`, `N-Quads`.

En cualquier caso, el volcado de ontología debe:

* Incluir suficiente información sobre clases, propiedades, adjunción de propiedades a clases (usando rdfs:domain, schema:domainIncludes u OWL restrictions) y taxonomías (individuos importantes).
* No incluir definiciones y ejemplos excesivamente verbosos e irrelevantes que no ayuden a la construcción de SPARQL.

```python
from langchain_community.graphs import OntotextGraphDBGraph

# feeding the schema using a user construct query

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    query_ontology="CONSTRUCT {?s ?p ?o} FROM <https://swapi.co/ontology/> WHERE {?s ?p ?o}",
)
```

```python
# feeding the schema using a local RDF file

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    local_file="/path/to/langchain_graphdb_tutorial/starwars-ontology.nt",  # change the path here
)
```

De cualquier manera, la ontología (esquema) se alimenta al LLM como `Turtle` ya que `Turtle` con los prefijos apropiados es más compacto y más fácil de recordar para el LLM.

La ontología de Star Wars es un poco inusual en que incluye muchos triples específicos sobre clases, por ejemplo, que la especie `:Aleena` vive en `<planet/38>`, son una subclase de `:Reptile`, tienen ciertas características típicas (altura promedio, esperanza de vida promedio, color de piel) y los individuos específicos (personajes) son representantes de esa clase:

```output
@prefix : <https://swapi.co/vocabulary/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:Aleena a owl:Class, :Species ;
    rdfs:label "Aleena" ;
    rdfs:isDefinedBy <https://swapi.co/ontology/> ;
    rdfs:subClassOf :Reptile, :Sentient ;
    :averageHeight 80.0 ;
    :averageLifespan "79" ;
    :character <https://swapi.co/resource/aleena/47> ;
    :film <https://swapi.co/resource/film/4> ;
    :language "Aleena" ;
    :planet <https://swapi.co/resource/planet/38> ;
    :skinColor "blue", "gray" .

    ...

```

Para mantener este tutorial simple, usamos GraphDB sin seguridad. Si GraphDB está asegurado, debes establecer las variables de entorno 'GRAPHDB_USERNAME' y 'GRAPHDB_PASSWORD' antes de la inicialización de `OntotextGraphDBGraph`.

```python
os.environ["GRAPHDB_USERNAME"] = "graphdb-user"
os.environ["GRAPHDB_PASSWORD"] = "graphdb-password"

graph = OntotextGraphDBGraph(
    query_endpoint=...,
    query_ontology=...
)
```

## Respuesta a preguntas contra el conjunto de datos de Star Wars

Ahora podemos usar `OntotextGraphDBQAChain` para hacer algunas preguntas.

```python
import os

from langchain.chains import OntotextGraphDBQAChain
from langchain_openai import ChatOpenAI

# We'll be using an OpenAI model which requires an OpenAI API Key.
# However, other models are available as well:
# https://python.langchain.com/docs/integrations/chat/

# Set the environment variable `OPENAI_API_KEY` to your OpenAI API key
os.environ["OPENAI_API_KEY"] = "sk-***"

# Any available OpenAI model can be used here.
# We use 'gpt-4-1106-preview' because of the bigger context window.
# The 'gpt-4-1106-preview' model_name will deprecate in the future and will change to 'gpt-4-turbo' or similar,
# so be sure to consult with the OpenAI API https://platform.openai.com/docs/models for the correct naming.

chain = OntotextGraphDBQAChain.from_llm(
    ChatOpenAI(temperature=0, model_name="gpt-4-1106-preview"),
    graph=graph,
    verbose=True,
)
```

Hagamos una simple.

```python
chain.invoke({chain.input_key: "What is the climate on Tatooine?"})[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?planet rdfs:label "Tatooine" ;
          :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
'The climate on Tatooine is arid.'
```

Y una un poco más complicada.

```python
chain.invoke({chain.input_key: "What is the climate on Luke Skywalker's home planet?"})[
    chain.output_key
]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?character rdfs:label "Luke Skywalker" .
  ?character :homeworld ?planet .
  ?planet :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
"The climate on Luke Skywalker's home planet is arid."
```

También podemos hacer preguntas más complicadas como

```python
chain.invoke(
    {
        chain.input_key: "What is the average box office revenue for all the Star Wars movies?"
    }
)[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT (AVG(?boxOffice) AS ?averageBoxOffice)
WHERE {
  ?film a :Film .
  ?film :boxOffice ?boxOfficeValue .
  BIND(xsd:decimal(?boxOfficeValue) AS ?boxOffice)
}
[0m

[1m> Finished chain.[0m
```

```output
'The average box office revenue for all the Star Wars movies is approximately 754.1 million dollars.'
```

## Modificadores de cadena

La cadena de QA de Ontotext GraphDB permite el refinamiento de indicaciones para mejorar aún más su cadena de QA y mejorar la experiencia general del usuario de su aplicación.

### Indicación de "Generación de SPARQL"

La indicación se usa para la generación de consultas SPARQL en función de la pregunta del usuario y el esquema del KG.

- `sparql_generation_prompt`

    Valor predeterminado:
  ````python
    GRAPHDB_SPARQL_GENERATION_TEMPLATE = """
    Escribe una consulta SPARQL SELECT para consultar una base de datos de gráficos.
    El esquema de ontología delimitado por tres comillas inversas en formato Turtle es:
    ```
    {schema}
    ```
    Usa solo las clases y propiedades proporcionadas en el esquema para construir la consulta SPARQL.
    No uses ninguna clase o propiedad que no se proporcione explícitamente en la consulta SPARQL.
    Incluye todos los prefijos necesarios.
    No incluyas explicaciones ni disculpas en tus respuestas.
    No envuelvas la consulta en comillas inversas.
    No incluyas ningún texto excepto la consulta SPARQL generada.
    La pregunta delimitada por tres comillas inversas es:
    ```
    {prompt}
    ```
    """
    GRAPHDB_SPARQL_GENERATION_PROMPT = PromptTemplate(
        input_variables=["schema", "prompt"],
        template=GRAPHDB_SPARQL_GENERATION_TEMPLATE,
    )
  ````

### Indicación de "Corrección de SPARQL"

A veces, el LLM puede generar una consulta SPARQL con errores sintácticos o que le faltan prefijos, etc. La cadena intentará enmendar esto solicitando al LLM que la corrija un cierto número de veces.

- `sparql_fix_prompt`

    Valor predeterminado:
  ````python
    GRAPHDB_SPARQL_FIX_TEMPLATE = """
    Esta siguiente consulta SPARQL delimitada por tres comillas inversas
    ```
    {generated_sparql}
    ```
    no es válida.
    El error delimitado por tres comillas inversas es
    ```
    {error_message}
    ```
    Dame una versión correcta de la consulta SPARQL.
    No cambies la lógica de la consulta.
    No incluyas explicaciones ni disculpas en tus respuestas.
    No envuelvas la consulta en comillas inversas.
    No incluyas ningún texto excepto la consulta SPARQL generada.
    El esquema de ontología delimitado por tres comillas inversas en formato Turtle es:
    ```
    {schema}
    ```
    """

    GRAPHDB_SPARQL_FIX_PROMPT = PromptTemplate(
        input_variables=["error_message", "generated_sparql", "schema"],
        template=GRAPHDB_SPARQL_FIX_TEMPLATE,
    )
  ````

- `max_fix_retries`

    Valor predeterminado: `5`

### "Responder" a la indicación

La indicación se usa para responder a la pregunta en función de los resultados devueltos desde la base de datos y la pregunta inicial del usuario. De forma predeterminada, se instruye al LLM para que solo use la información de los resultados devueltos. Si el conjunto de resultados está vacío, el LLM debe informar de que no puede responder a la pregunta.

- `qa_prompt`

  Valor predeterminado:
  ````python
    GRAPHDB_QA_TEMPLATE = """Tarea: Generar una respuesta en lenguaje natural a partir de los resultados de una consulta SPARQL.
    Eres un asistente que crea respuestas bien escritas y comprensibles para los humanos.
    La parte de información contiene la información proporcionada, que puedes usar para construir una respuesta.
    La información proporcionada es autoritativa, nunca debes dudarla ni intentar usar tu conocimiento interno para corregirla.
    Haz que tu respuesta suene como si la información proviniera de un asistente de IA, pero no agregues ninguna información.
    No uses conocimiento interno para responder a la pregunta, simplemente di que no sabes si no hay información disponible.
    Información:
    {context}

    Pregunta: {prompt}
    Respuesta útil:"""
    GRAPHDB_QA_PROMPT = PromptTemplate(
        input_variables=["context", "prompt"], template=GRAPHDB_QA_TEMPLATE
    )
  ````

Una vez que hayas terminado de jugar con QA con GraphDB, puedes apagar el entorno Docker ejecutando
``
docker compose down -v --remove-orphans
``
desde el directorio con el archivo Docker compose.
