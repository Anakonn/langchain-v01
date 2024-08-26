---
translated: true
---

# アンサンブル検索

`EnsembleRetriever`は、入力として検索アルゴリズムのリストを受け取り、それらの`get_relevant_documents()`メソッドの結果をアンサンブルし、[Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)アルゴリズムに基づいて結果をリランキングします。

さまざまなアルゴリズムの長所を活かすことで、`EnsembleRetriever`は単一のアルゴリズムよりも優れたパフォーマンスを達成できます。

最も一般的なパターンは、スパース検索アルゴリズム(BM25など)とデンス検索アルゴリズム(埋め込み類似度など)を組み合わせることです。これらの長所は相補的です。これは「ハイブリッド検索」としても知られています。スパース検索アルゴリズムはキーワードに基づいて関連文書を見つけるのが得意ですが、デンス検索アルゴリズムは意味的な類似性に基づいて関連文書を見つけるのが得意です。

```python
%pip install --upgrade --quiet  rank_bm25 > /dev/null
```

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
```

```python
doc_list_1 = [
    "I like apples",
    "I like oranges",
    "Apples and oranges are fruits",
]

# initialize the bm25 retriever and faiss retriever
bm25_retriever = BM25Retriever.from_texts(
    doc_list_1, metadatas=[{"source": 1}] * len(doc_list_1)
)
bm25_retriever.k = 2

doc_list_2 = [
    "You like apples",
    "You like oranges",
]

embedding = OpenAIEmbeddings()
faiss_vectorstore = FAISS.from_texts(
    doc_list_2, embedding, metadatas=[{"source": 2}] * len(doc_list_2)
)
faiss_retriever = faiss_vectorstore.as_retriever(search_kwargs={"k": 2})

# initialize the ensemble retriever
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever], weights=[0.5, 0.5]
)
```

```python
docs = ensemble_retriever.invoke("apples")
docs
```

```output
[Document(page_content='You like apples', metadata={'source': 2}),
 Document(page_content='I like apples', metadata={'source': 1}),
 Document(page_content='You like oranges', metadata={'source': 2}),
 Document(page_content='Apples and oranges are fruits', metadata={'source': 1})]
```

## ランタイム設定

実行時に検索アルゴリズムを設定することもできます。そのためには、フィールドを設定可能にする必要があります。

```python
from langchain_core.runnables import ConfigurableField
```

```python
faiss_retriever = faiss_vectorstore.as_retriever(
    search_kwargs={"k": 2}
).configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs_faiss",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

```python
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever], weights=[0.5, 0.5]
)
```

```python
config = {"configurable": {"search_kwargs_faiss": {"k": 1}}}
docs = ensemble_retriever.invoke("apples", config=config)
docs
```

FAISSの検索アルゴリズムからは1つのソースしか返されないことに注意してください。これは、実行時に関連する設定を渡しているためです。
