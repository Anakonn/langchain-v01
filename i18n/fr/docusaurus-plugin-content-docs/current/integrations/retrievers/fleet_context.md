---
translated: true
---

# Contexte de l'IA de la flotte

>[Contexte de l'IA de la flotte](https://www.fleet.so/context) est un ensemble de données d'embeddings de haute qualité des 1200 bibliothèques Python les plus populaires et les plus permissives et de leur documentation.

>L'équipe `Fleet AI` a pour mission d'incorporer les données les plus importantes du monde. Ils ont commencé par incorporer les 1200 principales bibliothèques Python pour permettre la génération de code avec des connaissances à jour. Ils ont eu la gentillesse de partager leurs embeddings de la [documentation LangChain](/docs/get_started/introduction) et de la [référence API](https://api.python.langchain.com/en/latest/api_reference.html).

Voyons comment nous pouvons utiliser ces embeddings pour alimenter un système de récupération de documentation et, en fin de compte, une simple chaîne de génération de code !

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

## Chunks du récupérateur

Dans le cadre de leur processus d'incorporation, l'équipe Fleet AI a d'abord découpé les longs documents avant de les incorporer. Cela signifie que les vecteurs correspondent à des sections de pages dans la documentation LangChain, et non à des pages entières. Par défaut, lorsque nous lancerons un récupérateur à partir de ces embeddings, nous récupérerons ces chunks incorporés.

Nous utiliserons `download_embeddings()` de Fleet Context pour récupérer les embeddings de la documentation LangChain. Vous pouvez consulter la documentation de toutes les bibliothèques prises en charge sur https://fleet.so/context.

```python
from context import download_embeddings

df = download_embeddings("langchain")
vecstore_retriever = load_fleet_retriever(df)
```

```python
vecstore_retriever.invoke("How does the multi vector retriever work")
```

## Autres packages

Vous pouvez télécharger et utiliser d'autres embeddings à partir de [ce lien Dropbox](https://www.dropbox.com/scl/fo/54t2e7fogtixo58pnlyub/h?rlkey=tne16wkssgf01jor0p1iqg6p9&dl=0).

## Récupérer les documents parents

Les embeddings fournis par Fleet AI contiennent des métadonnées qui indiquent quels chunks d'embedding correspondent à la même page de document d'origine. Si nous le souhaitons, nous pouvons utiliser ces informations pour récupérer des documents parents entiers, et pas seulement des chunks incorporés. En interne, nous utiliserons un MultiVectorRetriever et un objet BaseStore pour rechercher les chunks pertinents, puis les mapper à leur document parent.

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

## L'intégrer dans une chaîne

Essayons d'utiliser nos systèmes de récupération dans une simple chaîne !

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
