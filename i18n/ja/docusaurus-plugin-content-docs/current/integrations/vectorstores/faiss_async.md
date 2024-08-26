---
translated: true
---

# Faiss (非同期)

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/)は、密な ベクトルの効率的な類似検索とクラスタリングのためのライブラリです。RAM に収まらない可能性のあるサイズのベクトルセットで検索するアルゴリズムが含まれています。また、評価とパラメータチューニングのためのサポートコードも含まれています。

[Faiss ドキュメンテーション](https://faiss.ai/)。

このノートブックでは、`asyncio`を使って`FAISS`ベクトルデータベースの機能を使う方法を示します。
LangChainは同期および非同期のベクトルストア機能を実装しています。

同期バージョンは[こちら](/docs/integrations/vectorstores/faiss)をご覧ください。

```python
%pip install --upgrade --quiet  faiss-gpu # For CUDA 7.5+ Supported GPU's.
# OR
%pip install --upgrade --quiet  faiss-cpu # For CPU Installation
```

OpenAIEmbeddingsを使いたいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = await FAISS.afrom_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)

print(docs[0].page_content)
```

## スコア付きの類似検索

FAISSには特定のメソッドがいくつかあります。その1つが`similarity_search_with_score`で、ドキュメントだけでなくクエリとの距離スコアも返すことができます。返される距離スコアはL2距離です。したがって、スコアが低いほど良いです。

```python
docs_and_scores = await db.asimilarity_search_with_score(query)

docs_and_scores[0]
```

また、`similarity_search_by_vector`を使って、文字列ではなくエンベディングベクトルを使ってドキュメントを検索することもできます。

```python
embedding_vector = await embeddings.aembed_query(query)
docs_and_scores = await db.asimilarity_search_by_vector(embedding_vector)
```

## 保存と読み込み

FAISSインデックスを保存および読み込むこともできます。これは、使う度にインデックスを再作成する必要がないので便利です。

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings, asynchronous=True)

docs = await new_db.asimilarity_search(query)

docs[0]
```

# バイト列への直列化と逆直列化

これらの関数を使ってFAISSインデックスをピックルすることができます。エンベディングモデルのサイズが90 MB (sentence-transformers/all-MiniLM-L6-v2 や他のモデル)の場合、結果のピックルサイズは90 MB以上になります。モデルのサイズも全体のサイズに含まれます。これを回避するには、以下の関数を使います。これらの関数はFAISSインデックスのみを直列化するので、サイズはずっと小さくなります。SQLデータベースなどにインデックスを保存したい場合に役立ちます。

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss index
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl, asynchronous=True
)  # Load the index
```

## マージ

2つのFAISSベクトルストアをマージすることもできます。

```python
db1 = await FAISS.afrom_texts(["foo"], embeddings)
db2 = await FAISS.afrom_texts(["bar"], embeddings)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo')}
```

```python
db2.docstore._dict
```

```output
{'4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo'),
 '4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

## フィルタリング付きの類似検索

FAISSベクトルストアはフィルタリングもサポートしています。FAISSにはネイティブのフィルタリング機能がないので、手動で行う必要があります。これは、`k`個以上の結果を最初に取得し、その後フィルタリングするという方法で行います。メタデータに基づいてドキュメントをフィルタリングできます。また、任意の検索メソッドを呼び出す際に`fetch_k`パラメータを設定して、フィルタリング前に取得するドキュメントの数を指定することもできます。以下に小さな例を示します。

```python
from langchain_core.documents import Document

list_of_documents = [
    Document(page_content="foo", metadata=dict(page=1)),
    Document(page_content="bar", metadata=dict(page=1)),
    Document(page_content="foo", metadata=dict(page=2)),
    Document(page_content="barbar", metadata=dict(page=2)),
    Document(page_content="foo", metadata=dict(page=3)),
    Document(page_content="bar burr", metadata=dict(page=3)),
    Document(page_content="foo", metadata=dict(page=4)),
    Document(page_content="bar bruh", metadata=dict(page=4)),
]
db = FAISS.from_documents(list_of_documents, embeddings)
results_with_scores = db.similarity_search_with_score("foo")
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 2}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 3}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 4}, Score: 5.159960813797904e-15
```

同じクエリを呼び出しますが、`page = 1`のみをフィルタリングします。

```python
results_with_scores = await db.asimilarity_search_with_score("foo", filter=dict(page=1))
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

`max_marginal_relevance_search`でも同じことができます。

```python
results = await db.amax_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

`similarity_search`を呼び出す際の`fetch_k`パラメータの設定例です。通常、`fetch_k`パラメータは`k`パラメータよりも大きくする必要があります。これは、`fetch_k`パラメータがフィルタリング前に取得するドキュメントの数を表すためです。`fetch_k`を低い数値に設定すると、フィルタリングに十分なドキュメントが得られない可能性があります。

```python
results = await db.asimilarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## 削除

IDを削除することもできます。削除するIDはドキュメントストアのIDと一致している必要があります。

```python
db.delete([db.index_to_docstore_id[0]])
```

```output
True
```

```python
# Is now missing
0 in db.index_to_docstore_id
```

```output
False
```
