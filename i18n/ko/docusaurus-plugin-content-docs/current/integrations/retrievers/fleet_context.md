---
translated: true
---

# Fleet AI 컨텍스트

>[Fleet AI 컨텍스트](https://www.fleet.so/context)는 가장 인기 있고 허용적인 상위 1200개의 Python 라이브러리와 해당 문서의 고품질 임베딩 데이터셋입니다.

>`Fleet AI` 팀은 세계에서 가장 중요한 데이터를 임베딩하는 것을 목표로 하고 있습니다. 그들은 최신 지식으로 코드 생성을 가능하게 하기 위해 상위 1200개의 Python 라이브러리를 임베딩하기 시작했습니다. 그들은 [LangChain 문서](/docs/get_started/introduction)와 [API 참조](https://api.python.langchain.com/en/latest/api_reference.html)의 임베딩을 공유해 주었습니다.

이러한 임베딩을 사용하여 문서 검색 시스템과 간단한 코드 생성 체인을 구축하는 방법을 살펴보겠습니다.

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

## Retriever 청크

Fleet AI 팀은 임베딩 프로세스의 일환으로 긴 문서를 먼저 청크로 나누었습니다. 이는 벡터가 전체 페이지가 아닌 LangChain 문서의 섹션에 해당한다는 것을 의미합니다. 기본적으로 이러한 임베딩에서 retriever를 생성할 때 이러한 임베딩된 청크를 검색하게 됩니다.

`download_embeddings()`를 사용하여 LangChain 문서 임베딩을 가져올 것입니다. https://fleet.so/context에서 지원되는 모든 라이브러리의 문서를 확인할 수 있습니다.

```python
from context import download_embeddings

df = download_embeddings("langchain")
vecstore_retriever = load_fleet_retriever(df)
```

```python
vecstore_retriever.invoke("How does the multi vector retriever work")
```

## 기타 패키지

[이 Dropbox 링크](https://www.dropbox.com/scl/fo/54t2e7fogtixo58pnlyub/h?rlkey=tne16wkssgf01jor0p1iqg6p9&dl=0)에서 다른 임베딩을 다운로드하고 사용할 수 있습니다.

## 상위 문서 검색

Fleet AI가 제공하는 임베딩에는 동일한 원본 문서 페이지에 해당하는 임베딩 청크를 나타내는 메타데이터가 포함되어 있습니다. 필요한 경우 이 정보를 사용하여 전체 상위 문서를 검색할 수 있습니다. 내부적으로는 MultiVectorRetriever와 BaseStore 객체를 사용하여 관련 청크를 검색하고 이를 상위 문서에 매핑합니다.

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

## 체인에 적용하기

간단한 체인에서 검색 시스템을 사용해 보겠습니다!

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
