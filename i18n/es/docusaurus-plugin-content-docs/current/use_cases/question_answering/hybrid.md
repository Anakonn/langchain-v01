---
translated: true
---

# Búsqueda híbrida

La búsqueda estándar en LangChain se realiza mediante similitud vectorial. Sin embargo, varias implementaciones de vectorstores (Astra DB, ElasticSearch, Neo4J, AzureSearch, ...) también admiten búsquedas más avanzadas que combinan la búsqueda de similitud vectorial y otras técnicas de búsqueda (texto completo, BM25 y similares). Esto se conoce generalmente como búsqueda "híbrida".

**Paso 1: Asegúrate de que el vectorstore que estás utilizando admite búsqueda híbrida**

En este momento, no hay una forma unificada de realizar una búsqueda híbrida en LangChain. Cada vectorstore puede tener su propia forma de hacerlo. Esto generalmente se expone como un argumento de palabra clave que se pasa durante `similarity_search`. Leyendo la documentación o el código fuente, averigua si el vectorstore que estás utilizando admite búsqueda híbrida y, en caso afirmativo, cómo usarla.

**Paso 2: Agrega ese parámetro como un campo configurable para la cadena**

Esto te permitirá llamar fácilmente a la cadena y configurar cualquier indicador relevante en tiempo de ejecución. Consulta [esta documentación](/docs/expression_language/primitives/configure) para obtener más información sobre la configuración.

**Paso 3: Llama a la cadena con ese campo configurable**

Ahora, en tiempo de ejecución, puedes llamar a esta cadena con el campo configurable.

## Ejemplo de código

Veamos un ejemplo concreto de cómo se ve esto en el código. Utilizaremos la interfaz Cassandra/CQL de Astra DB para este ejemplo.

Instala el siguiente paquete de Python:

```python
!pip install "cassio>=0.1.7"
```

Obtén los [secretos de conexión](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html).

Inicializa cassio:

```python
import cassio

cassio.init(
    database_id="Your database ID",
    token="Your application token",
    keyspace="Your key space",
)
```

Crea el VectorStore de Cassandra con un [analizador de índice](https://docs.datastax.com/en/astra/astra-db-vector/cql/use-analyzers-with-cql.html) estándar. El analizador de índice es necesario para habilitar la coincidencia de términos.

```python
from cassio.table.cql import STANDARD_ANALYZER
from langchain_community.vectorstores import Cassandra
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = Cassandra(
    embedding=embeddings,
    table_name="test_hybrid",
    body_index_options=[STANDARD_ANALYZER],
    session=None,
    keyspace=None,
)

vectorstore.add_texts(
    [
        "In 2023, I visited Paris",
        "In 2022, I visited New York",
        "In 2021, I visited New Orleans",
    ]
)
```

Si realizamos una búsqueda de similitud estándar, obtendremos todos los documentos:

```python
vectorstore.as_retriever().invoke("What city did I visit last?")
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2023, I visited Paris'),
Document(page_content='In 2021, I visited New Orleans')]
```

El argumento `body_search` del vectorstore de Astra DB se puede utilizar para filtrar la búsqueda en el término `new`.

```python
vectorstore.as_retriever(search_kwargs={"body_search": "new"}).invoke(
    "What city did I visit last?"
)
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2021, I visited New Orleans')]
```

Ahora podemos crear la cadena que utilizaremos para hacer preguntas y respuestas sobre

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
```

Esta es una configuración básica de la cadena de preguntas y respuestas.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

Aquí marcamos el recuperador como un campo configurable. Todos los recuperadores de vectorstores tienen `search_kwargs` como campo. Esto es simplemente un diccionario, con campos específicos del vectorstore.

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

Ahora podemos crear la cadena utilizando nuestro recuperador configurable.

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

```python
chain.invoke("What city did I visit last?")
```

```output
Paris
```

Ahora podemos invocar la cadena con opciones configurables. `search_kwargs` es el id del campo configurable. El valor son los parámetros de búsqueda que se utilizarán para Astra DB.

```python
chain.invoke(
    "What city did I visit last?",
    config={"configurable": {"search_kwargs": {"body_search": "new"}}},
)
```

```output
New York
```
