---
translated: true
---

# Amazon Neptune con Cypher

>[Amazon Neptune](https://aws.amazon.com/neptune/) es una base de datos de análisis de gráficos de alto rendimiento y sin servidor para una escalabilidad y disponibilidad superiores.

>Este ejemplo muestra la cadena de preguntas y respuestas que consulta la base de datos de gráficos `Neptune` utilizando `openCypher` y devuelve una respuesta legible por humanos.

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) es un lenguaje de consulta de gráficos declarativo que permite una consulta de datos expresiva y eficiente en un gráfico de propiedades.

>[openCypher](https://opencypher.org/) es una implementación de código abierto de Cypher.# Cadena de preguntas y respuestas de Neptune Open Cypher
Esta cadena de preguntas y respuestas consulta Amazon Neptune utilizando openCypher y devuelve una respuesta legible por humanos

LangChain admite tanto [Neptune Database](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html) como [Neptune Analytics](https://docs.aws.amazon.com/neptune-analytics/latest/userguide/what-is-neptune-analytics.html) con `NeptuneOpenCypherQAChain`

Neptune Database es una base de datos de gráficos sin servidor diseñada para una escalabilidad y disponibilidad óptimas. Proporciona una solución para cargas de trabajo de bases de datos de gráficos que necesitan escalar a 100,000 consultas por segundo, alta disponibilidad de varios AZ y despliegues de varias regiones. Puede usar Neptune Database para aplicaciones de redes sociales, alertas de fraude y Atención al Cliente 360.

Neptune Analytics es un motor de base de datos de análisis que puede analizar rápidamente grandes cantidades de datos de gráficos en memoria para obtener información y encontrar tendencias. Neptune Analytics es una solución para analizar rápidamente bases de datos de gráficos existentes o conjuntos de datos de gráficos almacenados en un lago de datos. Utiliza algoritmos de análisis de gráficos populares y consultas analíticas de baja latencia.

## Uso de Neptune Database

```python
from langchain_community.graphs import NeptuneGraph

host = "<neptune-host>"
port = 8182
use_https = True

graph = NeptuneGraph(host=host, port=port, use_https=use_https)
```

### Uso de Neptune Analytics

```python
from langchain_community.graphs import NeptuneAnalyticsGraph

graph = NeptuneAnalyticsGraph(graph_identifier="<neptune-analytics-graph-id>")
```

## Uso de NeptuneOpenCypherQAChain

Esta cadena de preguntas y respuestas consulta la base de datos de gráficos Neptune utilizando openCypher y devuelve una respuesta legible por humanos.

```python
from langchain.chains import NeptuneOpenCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-4")

chain = NeptuneOpenCypherQAChain.from_llm(llm=llm, graph=graph)

chain.invoke("how many outgoing routes does the Austin airport have?")
```

```output
'The Austin airport has 98 outgoing routes.'
```
