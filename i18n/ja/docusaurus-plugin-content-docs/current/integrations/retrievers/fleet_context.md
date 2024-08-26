---
translated: true
---

# Fleet AI コンテキスト

>[Fleet AI コンテキスト](https://www.fleet.so/context)は、最も人気のある許可の高い Python ライブラリと、それらのドキュメントの高品質な埋め込みのデータセットです。

>`Fleet AI`チームは、世界で最も重要なデータを埋め込むことを目的としています。彼らは、最新の知識を使ってコード生成を可能にするために、トップ1200の Python ライブラリを埋め込むことから始めました。彼らは[LangChain ドキュメント](/docs/get_started/introduction)と[API リファレンス](https://api.python.langchain.com/en/latest/api_reference.html)の埋め込みを共有してくれました。

これらの埋め込みを使って、ドキュメント検索システムとシンプルなコード生成チェーンを構築する方法を見ていきましょう。

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

## リトリーバーのチャンク

Fleet AI チームは、埋め込みプロセスの一環として、長いドキュメントをチャンクに分割しました。これは、ベクトルが LangChain ドキュメントのページ全体ではなく、セクションに対応することを意味します。デフォルトでは、これらの埋め込みからリトリーバーを立ち上げると、これらの埋め込まれたチャンクを取得することになります。

`download_embeddings()`を使って、LangChain のドキュメントの埋め込みを取得します。サポートされているすべてのライブラリのドキュメントは https://fleet.so/context で確認できます。

```python
from context import download_embeddings

df = download_embeddings("langchain")
vecstore_retriever = load_fleet_retriever(df)
```

```python
vecstore_retriever.invoke("How does the multi vector retriever work")
```

## その他のパッケージ

[このDropboxリンク](https://www.dropbox.com/scl/fo/54t2e7fogtixo58pnlyub/h?rlkey=tne16wkssgf01jor0p1iqg6p9&dl=0)から、他の埋め込みをダウンロードして使うことができます。

## 親ドキュメントの取得

Fleet AI が提供する埋め込みには、同じ元のドキュメントページに対応する埋め込みチャンクを示すメタデータが含まれています。必要に応じて、この情報を使って、埋め込みチャンクではなく、完全な親ドキュメントを取得することができます。内部的には、MultiVectorRetrieverとBaseStoreオブジェクトを使って、関連するチャンクを検索し、それらを親ドキュメントにマッピングします。

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

## チェーンに組み込む

簡単なチェーンでリトリーバーシステムを使ってみましょう!

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
