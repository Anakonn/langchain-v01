---
sidebar_position: 4
translated: true
---

# Recuperación por usuario

Cuando se construye una aplicación de recuperación, a menudo hay que construirla teniendo en cuenta a varios usuarios. Esto significa que es posible que esté almacenando datos no solo para un usuario, sino para muchos usuarios diferentes, y no deben poder ver los datos de los demás. Esto significa que debe poder configurar su cadena de recuperación para recuperar solo cierta información. Esto generalmente implica dos pasos.

**Paso 1: Asegúrese de que el recuperador que está utilizando admite varios usuarios**

En este momento, no hay una bandera o filtro unificado para esto en LangChain. Más bien, cada almacén de vectores y recuperador puede tener el suyo propio, y pueden llamarse de manera diferente (espacios de nombres, multiinquilino, etc). Para los almacenes de vectores, esto generalmente se expone como un argumento de palabra clave que se pasa durante `similarity_search`. Leyendo la documentación o el código fuente, averigüe si el recuperador que está utilizando admite varios usuarios y, en caso afirmativo, cómo usarlo.

Nota: agregar documentación y/o soporte para varios usuarios para los recuperadores que no lo admiten (o no lo documentan) es una EXCELENTE manera de contribuir a LangChain

**Paso 2: Agregue ese parámetro como un campo configurable para la cadena**

Esto le permitirá llamar fácilmente a la cadena y configurar cualquier bandera relevante en tiempo de ejecución. Consulte [esta documentación](/docs/expression_language/primitives/configure) para obtener más información sobre la configuración.

**Paso 3: Llame a la cadena con ese campo configurable**

Ahora, en tiempo de ejecución, puede llamar a esta cadena con el campo configurable.

## Ejemplo de código

Veamos un ejemplo concreto de cómo se ve esto en el código. Usaremos Pinecone para este ejemplo.

Para configurar Pinecone, establezca la siguiente variable de entorno:

- `PINECONE_API_KEY`: Su clave API de Pinecone

```python
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
```

```python
embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```

```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```

El argumento clave de Pinecone `namespace` se puede usar para separar documentos

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook')]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"namespace": "harrison"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho')]
```

Ahora podemos crear la cadena que usaremos para hacer preguntas y respuestas sobre

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
    RunnableLambda,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

Esta es una cadena básica de preguntas y respuestas configurada.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

Aquí marcamos el recuperador como un campo configurable. Todos los recuperadores de almacenes de vectores tienen `search_kwargs` como campo. Esto es solo un diccionario, con campos específicos del almacén de vectores

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

Ahora podemos crear la cadena usando nuestro recuperador configurable

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

Ahora podemos invocar la cadena con opciones configurables. `search_kwargs` es el id del campo configurable. El valor son los parámetros de búsqueda a usar para Pinecone

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```

```output
'The user worked at Kensho.'
```

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```

```output
'The user worked at Facebook.'
```

Para más implementaciones de almacenes de vectores para varios usuarios, consulte las páginas específicas, como [Milvus](/docs/integrations/vectorstores/milvus).
