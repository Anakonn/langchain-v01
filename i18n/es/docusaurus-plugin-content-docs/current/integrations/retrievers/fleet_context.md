---
translated: true
---

# Contexto de Fleet AI

>[Contexto de Fleet AI](https://www.fleet.so/context) es un conjunto de datos de incrustaciones de alta calidad de las 1200 bibliotecas de Python más populares y permisivas y su documentación.

>El equipo de `Fleet AI` tiene la misión de incrustar los datos más importantes del mundo. Han comenzado incrustando las 1200 principales bibliotecas de Python para permitir la generación de código con conocimientos actualizados. Han sido lo suficientemente amables como para compartir sus incrustaciones de la [documentación de LangChain](/docs/get_started/introduction) y la [referencia de API](https://api.python.langchain.com/en/latest/api_reference.html).

¡Echemos un vistazo a cómo podemos usar estas incrustaciones para impulsar un sistema de recuperación de documentación y, en última instancia, una cadena simple de generación de código!

```python
%pip install --upgrade --quiet  langchain fleet-context langchain-openai pandas faiss-cpu # faiss-gpu for CUDA supported GPU
```

```python
from operator import itemgetter
from typing import Any, Optional, Type

import pandas as pd
from langchain.retrievers import MultiVectorRetriever
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.stores import BaseStore
from langchain_core.vectorstores import VectorStore
from langchain_openai import OpenAIEmbeddings


def load_fleet_retriever(
    df: pd.DataFrame,
    *,
    vectorstore_cls: Type[VectorStore] = FAISS,
    docstore: Optional[BaseStore] = None,
    **kwargs: Any,
):
    vectorstore = _populate_vectorstore(df, vectorstore_cls)
    if docstore is None:
        return vectorstore.as_retriever(**kwargs)
    else:
        _populate_docstore(df, docstore)
        return MultiVectorRetriever(
            vectorstore=vectorstore, docstore=docstore, id_key="parent", **kwargs
        )


def _populate_vectorstore(
    df: pd.DataFrame,
    vectorstore_cls: Type[VectorStore],
) -> VectorStore:
    if not hasattr(vectorstore_cls, "from_embeddings"):
        raise ValueError(
            f"Incompatible vector store class {vectorstore_cls}."
            "Must implement `from_embeddings` class method."
        )
    texts_embeddings = []
    metadatas = []
    for _, row in df.iterrows():
        texts_embeddings.append((row.metadata["text"], row["dense_embeddings"]))
        metadatas.append(row.metadata)
    return vectorstore_cls.from_embeddings(
        texts_embeddings,
        OpenAIEmbeddings(model="text-embedding-ada-002"),
        metadatas=metadatas,
    )


def _populate_docstore(df: pd.DataFrame, docstore: BaseStore) -> None:
    parent_docs = []
    df = df.copy()
    df["parent"] = df.metadata.apply(itemgetter("parent"))
    for parent_id, group in df.groupby("parent"):
        sorted_group = group.iloc[
            group.metadata.apply(itemgetter("section_index")).argsort()
        ]
        text = "".join(sorted_group.metadata.apply(itemgetter("text")))
        metadata = {
            k: sorted_group.iloc[0].metadata[k] for k in ("title", "type", "url")
        }
        text = metadata["title"] + "\n" + text
        metadata["id"] = parent_id
        parent_docs.append(Document(page_content=text, metadata=metadata))
    docstore.mset(((d.metadata["id"], d) for d in parent_docs))
```

## Trozos del buscador

Como parte de su proceso de incrustación, el equipo de Fleet AI primero dividió en trozos los documentos largos antes de incrustarlos. Esto significa que los vectores corresponden a secciones de páginas en la documentación de LangChain, no a páginas completas. De forma predeterminada, cuando activemos un buscador a partir de estas incrustaciones, estaremos recuperando estos trozos incrustados.

Utilizaremos `download_embeddings()` de Fleet Context para obtener las incrustaciones de la documentación de Langchain. Puede ver la documentación de todas las bibliotecas compatibles en https://fleet.so/context.

```python
from context import download_embeddings

df = download_embeddings("langchain")
vecstore_retriever = load_fleet_retriever(df)
```

```python
vecstore_retriever.invoke("How does the multi vector retriever work")
```

## Otros paquetes

Puede descargar y utilizar otras incrustaciones desde [este enlace de Dropbox](https://www.dropbox.com/scl/fo/54t2e7fogtixo58pnlyub/h?rlkey=tne16wkssgf01jor0p1iqg6p9&dl=0).

## Recuperar documentos principales

Las incrustaciones proporcionadas por Fleet AI contienen metadatos que indican a qué página de documento original corresponden los trozos de incrustación. Si lo deseamos, podemos utilizar esta información para recuperar documentos principales completos, y no solo trozos incrustados. Internamente, utilizaremos un MultiVectorRetriever y un objeto BaseStore para buscar los trozos relevantes y luego mapearlos a su documento principal.

```python
from langchain.storage import InMemoryStore

parent_retriever = load_fleet_retriever(
    "https://www.dropbox.com/scl/fi/4rescpkrg9970s3huz47l/libraries_langchain_release.parquet?rlkey=283knw4wamezfwiidgpgptkep&dl=1",
    docstore=InMemoryStore(),
)
```

```python
parent_retriever.invoke("How does the multi vector retriever work")
```

## Ponerlo en una cadena

¡Intentemos usar nuestros sistemas de recuperación en una cadena simple!

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a great software engineer who is very familiar \
with Python. Given a user question or request about a new Python library called LangChain and \
parts of the LangChain documentation, answer the question or generate the requested code. \
Your answers must be accurate, should include code whenever possible, and should assume anything \
about LangChain which is note explicitly stated in the LangChain documentation. If the required \
information is not available, just say so.

LangChain Documentation
------------------

{context}""",
        ),
        ("human", "{question}"),
    ]
)

model = ChatOpenAI(model="gpt-3.5-turbo-16k")

chain = (
    {
        "question": RunnablePassthrough(),
        "context": parent_retriever
        | (lambda docs: "\n\n".join(d.page_content for d in docs)),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
for chunk in chain.invoke(
    "How do I create a FAISS vector store retriever that returns 10 documents per search query"
):
    print(chunk, end="", flush=True)
```
