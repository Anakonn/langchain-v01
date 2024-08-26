---
translated: true
---

# Construcción de gráficos de conocimiento

En esta guía repasaremos las formas básicas de construir un gráfico de conocimiento a partir de texto no estructurado. El gráfico construido se puede utilizar como base de conocimiento en una aplicación RAG.

## ⚠️ Nota de seguridad ⚠️

La construcción de gráficos de conocimiento requiere ejecutar acceso de escritura a la base de datos. Existen riesgos inherentes al hacer esto. Asegúrese de verificar y validar los datos antes de importarlos. Para más información sobre las mejores prácticas de seguridad en general, [consulte aquí](/docs/security).

## Arquitectura

A grandes rasgos, los pasos para construir un gráfico de conocimiento a partir de texto son:

1. **Extracción de información estructurada del texto**: Se utiliza un modelo para extraer información estructurada del gráfico a partir del texto.
2. **Almacenamiento en la base de datos de gráficos**: Almacenar la información estructurada del gráfico extraída en una base de datos de gráficos permite aplicaciones RAG posteriores.

## Configuración

Primero, obtén los paquetes necesarios y establece las variables de entorno.
En este ejemplo, utilizaremos la base de datos de gráficos Neo4j.

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai langchain-experimental neo4j
```

```output
Note: you may need to restart the kernel to use updated packages.
```

Utilizamos modelos de OpenAI de forma predeterminada en esta guía.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

```output
 ········
```

A continuación, debemos definir las credenciales y la conexión de Neo4j.
Siga los [pasos de instalación](https://neo4j.com/docs/operations-manual/current/installation/) para configurar una base de datos Neo4j.

```python
import os

from langchain_community.graphs import Neo4jGraph

os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"

graph = Neo4jGraph()
```

## Transformador de gráficos LLM

La extracción de datos de gráficos a partir de texto permite la transformación de información no estructurada en formatos estructurados, facilitando una visión más profunda y una navegación más eficiente a través de relaciones y patrones complejos. El `LLMGraphTransformer` convierte documentos de texto en documentos de gráficos estructurados aprovechando un LLM para analizar y categorizar entidades y sus relaciones. La selección del modelo LLM influye significativamente en el resultado al determinar la precisión y el matiz de los datos de gráficos extraídos.

```python
import os

from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model_name="gpt-4-turbo")

llm_transformer = LLMGraphTransformer(llm=llm)
```

Ahora podemos pasar un texto de ejemplo y examinar los resultados.

```python
from langchain_core.documents import Document

text = """
Marie Curie, born in 1867, was a Polish and naturalised-French physicist and chemist who conducted pioneering research on radioactivity.
She was the first woman to win a Nobel Prize, the first person to win a Nobel Prize twice, and the only person to win a Nobel Prize in two scientific fields.
Her husband, Pierre Curie, was a co-winner of her first Nobel Prize, making them the first-ever married couple to win the Nobel Prize and launching the Curie family legacy of five Nobel Prizes.
She was, in 1906, the first woman to become a professor at the University of Paris.
"""
documents = [Document(page_content=text)]
graph_documents = llm_transformer.convert_to_graph_documents(documents)
print(f"Nodes:{graph_documents[0].nodes}")
print(f"Relationships:{graph_documents[0].relationships}")
```

```output
Nodes:[Node(id='Marie Curie', type='Person'), Node(id='Pierre Curie', type='Person'), Node(id='University Of Paris', type='Organization')]
Relationships:[Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='Pierre Curie', type='Person'), type='MARRIED'), Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='University Of Paris', type='Organization'), type='PROFESSOR')]
```

Examine la siguiente imagen para comprender mejor la estructura del gráfico de conocimiento generado.

![graph_construction1.png](../../../../../../static/img/graph_construction1.png)

Tenga en cuenta que el proceso de construcción del gráfico no es determinista, ya que estamos utilizando LLM. Por lo tanto, es posible que obtenga resultados ligeramente diferentes en cada ejecución.

Además, tiene la flexibilidad de definir tipos específicos de nodos y relaciones para la extracción de acuerdo con sus requisitos.

```python
llm_transformer_filtered = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Country", "Organization"],
    allowed_relationships=["NATIONALITY", "LOCATED_IN", "WORKED_AT", "SPOUSE"],
)
graph_documents_filtered = llm_transformer_filtered.convert_to_graph_documents(
    documents
)
print(f"Nodes:{graph_documents_filtered[0].nodes}")
print(f"Relationships:{graph_documents_filtered[0].relationships}")
```

```output
Nodes:[Node(id='Marie Curie', type='Person'), Node(id='Pierre Curie', type='Person'), Node(id='University Of Paris', type='Organization')]
Relationships:[Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='Pierre Curie', type='Person'), type='SPOUSE'), Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='University Of Paris', type='Organization'), type='WORKED_AT')]
```

Para una mejor comprensión del gráfico generado, podemos volver a visualizarlo.

![graph_construction2.png](../../../../../../static/img/graph_construction2.png)

El parámetro `node_properties` permite la extracción de propiedades de nodos, lo que permite crear un gráfico más detallado.
Cuando se establece en `True`, LLM identifica y extrae de forma autónoma las propiedades de nodos relevantes.
Por el contrario, si `node_properties` se define como una lista de cadenas, el LLM recupera selectivamente solo las propiedades especificadas del texto.

```python
llm_transformer_props = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Country", "Organization"],
    allowed_relationships=["NATIONALITY", "LOCATED_IN", "WORKED_AT", "SPOUSE"],
    node_properties=["born_year"],
)
graph_documents_props = llm_transformer_props.convert_to_graph_documents(documents)
print(f"Nodes:{graph_documents_props[0].nodes}")
print(f"Relationships:{graph_documents_props[0].relationships}")
```

```output
Nodes:[Node(id='Marie Curie', type='Person', properties={'born_year': '1867'}), Node(id='Pierre Curie', type='Person'), Node(id='University Of Paris', type='Organization')]
Relationships:[Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='Pierre Curie', type='Person'), type='SPOUSE'), Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='University Of Paris', type='Organization'), type='WORKED_AT')]
```

## Almacenamiento en la base de datos de gráficos

Los documentos de gráficos generados se pueden almacenar en una base de datos de gráficos utilizando el método `add_graph_documents`.

```python
graph.add_graph_documents(graph_documents_props)
```
