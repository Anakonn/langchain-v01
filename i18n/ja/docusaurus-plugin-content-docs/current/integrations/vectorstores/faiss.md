---
translated: true
---

# Faiss

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/)は、密な ベクトルの効率的な類似検索とクラスタリングのためのライブラリです。RAM に収まらない可能性のあるサイズのベクトルセットで検索するアルゴリズムが含まれています。また、評価とパラメータチューニングのためのサポートコードも含まれています。

[Faiss documentation](https://faiss.ai/)。

このノートブックでは、`FAISS`ベクトルデータベースに関連する機能の使用方法を示します。このインテグレーションに固有の機能を示します。完了後、[関連するユースケースページ](/docs/use_cases/question_answering)を探索すると、このベクトルストアをより大きなチェーンの一部として使用する方法を学ぶのに役立つかもしれません。

## セットアップ

このインテグレーションは`langchain-community`パッケージに存在します。また、`faiss`パッケージ自体もインストールする必要があります。OpenAIの埋め込みも使用するので、それらの要件もインストールする必要があります。これらは以下のようにインストールできます。

```bash
pip install -U langchain-community faiss-cpu langchain-openai tiktoken
```

GPUサポート版の`faiss-gpu`をインストールすることもできます。

OpenAIを使用しているので、OpenAI APIキーが必要です。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

[LangSmith](https://smith.langchain.com/)を設定するのも (必須ではありませんが) 役立ちます。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 取り込み

ここでは、ドキュメントをベクトルストアに取り込みます。

```python
# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(docs, embeddings)
print(db.index.ntotal)
```

```output
42
```

## クエリ

次に、ベクトルストアにクエリを行います。これには幾つかの方法があります。最も標準的なのは`similarity_search`を使うことです。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Retrieverとして

ベクトルストアを[Retriever](/docs/modules/data_connection/retrievers)クラスに変換することもできます。これにより、他のLangChainメソッドで簡単に使用できるようになります。

```python
retriever = db.as_retriever()
docs = retriever.invoke(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## スコア付きの類似検索

FAISSには特有のメソッドがいくつかあります。その1つが`similarity_search_with_score`で、ドキュメントだけでなくクエリとの距離スコアも返します。返される距離スコアはL2距離です。したがって、スコアが低いほど良いです。

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.36913747)
```

また、`similarity_search_by_vector`を使って、埋め込みベクトルに似たドキュメントを検索することもできます。これは文字列ではなく埋め込みベクトルをパラメータとして受け取ります。

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = db.similarity_search_by_vector(embedding_vector)
```

## 保存と読み込み

FAISSインデックスを保存および読み込むこともできます。これは、毎回使用するときに再作成する必要がないので便利です。

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings)

docs = new_db.similarity_search(query)
```

```python
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

# バイトへのシリアル化とデシリアル化

これらの関数を使ってFAISSインデックスをpickleできます。埋め込みモデルのサイズが90 MB (sentence-transformers/all-MiniLM-L6-v2 や他のモデル) の場合、結果のpickleサイズは90 MB以上になります。モデルのサイズも全体のサイズに含まれます。これを回避するには、以下の関数を使用します。これらの関数はFAISSインデックスのみをシリアル化するので、サイズはずっと小さくなります。SQLデータベースのようなデータベースにインデックスを保存したい場合に役立ちます。

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl
)  # Load the index
```

## マージ

2つのFAISSベクトルストアをマージすることもできます。

```python
db1 = FAISS.from_texts(["foo"], embeddings)
db2 = FAISS.from_texts(["bar"], embeddings)

db1.docstore._dict
```

```python
db2.docstore._dict
```

```output
{'807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'068c473b-d420-487a-806b-fb0ccea7f711': Document(page_content='foo', metadata={}),
 '807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

## フィルタリング付き類似検索

FAISSベクトルストアはフィルタリングもサポートできます。FAISSにはネイティブのフィルタリングがないので、手動で行う必要があります。これは、まず`k`よりも多くの結果を取得し、その後フィルタリングするという方法で行います。このフィルタは、入力としてメタデータ辞書を受け取り、boolを返すコールバック関数、または各キーが存在しない場合は無視され、存在する各kがリストの値に含まれるメタデータ辞書のいずれかです。また、任意の検索メソッドを呼び出す際に`fetch_k`パラメータを設定して、フィルタリング前に取得するドキュメントの数を指定することもできます。以下に小さな例を示します。

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

同じクエリ呼び出しを行いますが、`page = 1`のみをフィルタリングします。

```python
results_with_scores = db.similarity_search_with_score("foo", filter=dict(page=1))
# Or with a callable:
# results_with_scores = db.similarity_search_with_score("foo", filter=lambda d: d["page"] == 1)
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

同様のことを`max_marginal_relevance_search`でも行えます。

```python
results = db.max_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

`similarity_search`を呼び出す際の`fetch_k`パラメータの設定例です。通常、`fetch_k`パラメータは`k`パラメータよりも大きくする必要があります。これは、`fetch_k`パラメータがフィルタリング前に取得するドキュメントの数を表すためです。`fetch_k`を低い数に設定すると、フィルタリングに十分なドキュメントが得られない可能性があります。

```python
results = db.similarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## 削除

ベクトルストアからレコードを削除することもできます。以下の例では、`db.index_to_docstore_id`がFAISSインデックスを表すディクショナリを表しています。

```python
print("count before:", db.index.ntotal)
db.delete([db.index_to_docstore_id[0]])
print("count after:", db.index.ntotal)
```

```output
count before: 8
count after: 7
```
