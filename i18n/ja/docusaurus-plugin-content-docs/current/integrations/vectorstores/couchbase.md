---
translated: true
---

# Couchbase

[Couchbase](http://couchbase.com/)は、クラウド、モバイル、AI、エッジコンピューティングのアプリケーションに対して、並外れた柔軟性、パフォーマンス、スケーラビリティ、および財務的価値を提供する受賞歴のあるディストリビューテッドNoSQLクラウドデータベースです。Couchbaseはデベロッパーのためのコーディングアシスタンスやアプリケーションのベクトル検索など、AIを取り入れています。

ベクトル検索は、[Full Text Search Service](https://docs.couchbase.com/server/current/learn/services-and-indexes/services/search-service.html)（Search Service）の一部です。

このチュートリアルでは、Couchbaseでのベクトル検索の使用方法を説明します。[Couchbase Capella](https://www.couchbase.com/products/capella/)とセルフマネージドのCouchbase Serverの両方で作業できます。

## インストール

```python
%pip install --upgrade --quiet langchain langchain-openai couchbase
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## ベクトルストアとEmbeddingsのインポート

```python
from langchain_community.vectorstores import CouchbaseVectorStore
from langchain_openai import OpenAIEmbeddings
```

## Couchbaseコネクションオブジェクトの作成

最初にCouchbaseクラスターへの接続を作成し、その後クラスターオブジェクトをベクトルストアに渡します。

ここでは、ユーザー名とパスワードを使ってコネクションを作成しています。クラスターに接続する他の方法も使えます。

Couchbaseクラスターへの接続の詳細については、[Python SDKドキュメンテーション](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html#connect)を参照してください。

```python
COUCHBASE_CONNECTION_STRING = (
    "couchbase://localhost"  # or "couchbases://localhost" if using TLS
)
DB_USERNAME = "Administrator"
DB_PASSWORD = "Password"
```

```python
from datetime import timedelta

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions

auth = PasswordAuthenticator(DB_USERNAME, DB_PASSWORD)
options = ClusterOptions(auth)
cluster = Cluster(COUCHBASE_CONNECTION_STRING, options)

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

ベクトル検索に使用するCouchbaseクラスターのバケット、スコープ、コレクション名を設定します。

この例では、デフォルトのスコープとコレクションを使用しています。

```python
BUCKET_NAME = "testing"
SCOPE_NAME = "_default"
COLLECTION_NAME = "_default"
SEARCH_INDEX_NAME = "vector-index"
```

このチュートリアルでは、OpenAIのEmbeddingsを使用します。

```python
embeddings = OpenAIEmbeddings()
```

## 検索インデックスの作成

現在、検索インデックスはCouchbase CapellaまたはサーバーのUIから、またはREST interfaceを使って作成する必要があります。

`vector-index`という名前の検索インデックスを`testing`バケットに定義しましょう。

この例では、Search ServiceのUIでImport Indexの機能を使用します。

`testing`バケットの`_default`スコープの`_default`コレクションに、ベクトルフィールドを`embedding`、1536次元に設定し、テキストフィールドを`text`に設定するインデックスを定義しています。また、文書の構造の変化に対応するため、`metadata`の下のすべてのフィールドをダイナミックマッピングでインデックス化して保存しています。類似度メトリックは`dot_product`に設定されています。

### Full Text Search serviceにインデックスをインポートする方法

 - [Couchbase Server](https://docs.couchbase.com/server/current/search/import-search-index.html)
     - Search -> Add Index -> Importをクリック
     - 以下のインデックス定義をImportの画面にコピー
     - Create Indexをクリックしてインデックスを作成
 - [Couchbase Capella](https://docs.couchbase.com/cloud/search/import-search-index.html)
     - インデックス定義を`index.json`という新しいファイルにコピー
     - ドキュメントの手順に従ってCapellaにファイルをインポート
     - Create Indexをクリックしてインデックスを作成

### インデックス定義

```json
{
 "name": "vector-index",
 "type": "fulltext-index",
 "params": {
  "doc_config": {
   "docid_prefix_delim": "",
   "docid_regexp": "",
   "mode": "type_field",
   "type_field": "type"
  },
  "mapping": {
   "default_analyzer": "standard",
   "default_datetime_parser": "dateTimeOptional",
   "default_field": "_all",
   "default_mapping": {
    "dynamic": true,
    "enabled": true,
    "properties": {
     "metadata": {
      "dynamic": true,
      "enabled": true
     },
     "embedding": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "dims": 1536,
        "index": true,
        "name": "embedding",
        "similarity": "dot_product",
        "type": "vector",
        "vector_index_optimized_for": "recall"
       }
      ]
     },
     "text": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "index": true,
        "name": "text",
        "store": true,
        "type": "text"
       }
      ]
     }
    }
   },
   "default_type": "_default",
   "docvalues_dynamic": false,
   "index_dynamic": true,
   "store_dynamic": true,
   "type_field": "_type"
  },
  "store": {
   "indexType": "scorch",
   "segmentVersion": 16
  }
 },
 "sourceType": "gocbcore",
 "sourceName": "testing",
 "sourceParams": {},
 "planParams": {
  "maxPartitionsPerPIndex": 103,
  "indexPartitions": 10,
  "numReplicas": 0
 }
}
```

ベクトルフィールドをサポートする検索インデックスの作成の詳細については、ドキュメントを参照してください。

- [Couchbase Capella](https://docs.couchbase.com/cloud/vector-search/create-vector-search-index-ui.html)

- [Couchbase Server](https://docs.couchbase.com/server/current/vector-search/create-vector-search-index-ui.html)

## ベクトルストアの作成

クラスター情報と検索インデックス名を使ってベクトルストアオブジェクトを作成します。

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
)
```

### テキストとEmbeddingsフィールドの指定

`text_key`と`embedding_key`フィールドを使って、文書のテキストとEmbeddingsフィールドを任意で指定できます。

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
    text_key="text",
    embedding_key="embedding",
)
```

## 基本的なベクトル検索の例

この例では、"state_of_the_union.txt"ファイルをTextLoaderで読み込み、500文字のチャンクに分割して重複なしにCouchbaseにインデックスします。

データがインデックス化された後、"What did president say about Ketanji Brown Jackson"というクエリに対して、上位4件の類似したチャンクを検索します。

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vector_store = CouchbaseVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    index_name=SEARCH_INDEX_NAME,
)
```

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## スコアを伴う類似検索

`similarity_search_with_score`メソッドを呼び出すことで、結果のスコアを取得できます。

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search_with_score(query)
document, score = results[0]
print(document)
print(f"Score: {score}")
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
Score: 0.8211871385574341
```

## 返すフィールドの指定

`fields`パラメーターを使って、文書から返すフィールドを指定できます。これらのフィールドは、返された文書の`metadata`オブジェクトの一部として返されます。検索インデックスに保存されているフィールドであれば、どれでも取得できます。文書の`page_content`には`text_key`が含まれます。

フィールドを指定しない場合は、インデックスに保存されているすべてのフィールドが返されます。

メタデータ内のフィールドを取得する場合は、`.`を使って指定する必要があります。

例えば、`metadata.source`フィールドを取得するには、`metadata.source`と指定します。

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query, fields=["metadata.source"])
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## ハイブリッド検索

Couchbaseでは、ベクトル検索と`metadata`オブジェクトなどの非ベクトルフィールドの検索を組み合わせたハイブリッド検索を行うことができます。

結果は、ベクトル検索とSearch Serviceによる検索の両方の結果を組み合わせたものになります。各コンポーネント検索の得点が加算されて、最終的な得点となります。

ハイブリッド検索を行うには、すべての類似検索に`search_options`パラメーターを渡すことができます。
`search_options`のさまざまな検索/クエリの可能性については、[こちら](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)を参照してください。

### 多様なメタデータの作成によるハイブリッド検索

既存のドキュメントからランダムなメタデータを作成して、ハイブリッド検索をシミュレーションしましょう。
メタデータに `date` (2010 ~ 2020)、`rating` (1 ~ 5)、`author` (John Doe または Jane Doe) の3つのフィールドを均等に追加します。

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

vector_store.add_documents(docs)

query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0].metadata)
```

```output
{'author': 'John Doe', 'date': '2016-01-01', 'rating': 2, 'source': '../../modules/state_of_the_union.txt'}
```

### 完全一致検索の例

`metadata` オブジェクトの作者フィールドで完全一致検索を行うことができます。

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={"query": {"field": "metadata.author", "match": "John Doe"}},
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.' metadata={'author': 'John Doe'}
```

### 部分一致検索の例

検索クエリの微妙な変化や誤字を検索するために、ファジー検索を使用できます。

ここでは "Jae" が "Jane" に近い (ファジー1) です。

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {"field": "metadata.author", "match": "Jae", "fuzziness": 1}
    },
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.' metadata={'author': 'Jane Doe'}
```

### 日付範囲検索の例

`metadata.date` の日付範囲検索を行うことができます。

```python
query = "Any mention about independence?"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {
            "start": "2016-12-31",
            "end": "2017-01-02",
            "inclusive_start": True,
            "inclusive_end": False,
            "field": "metadata.date",
        }
    },
)
print(results[0])
```

```output
page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.' metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}
```

### 数値範囲検索の例

`metadata.rating` の数値範囲検索を行うことができます。

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "min": 3,
            "max": 5,
            "inclusive_min": True,
            "inclusive_max": True,
            "field": "metadata.rating",
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 0.9000703597577832)
```

### 複数の検索クエリの組み合わせ

AND (conjuncts) や OR (disjuncts) 演算子を使って、複数の検索クエリを組み合わせることができます。

この例では、レーティングが3~4の間で、2015~2018年のドキュメントを検索しています。

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "conjuncts": [
                {"min": 3, "max": 4, "inclusive_max": True, "field": "metadata.rating"},
                {"start": "2016-12-31", "end": "2017-01-02", "field": "metadata.date"},
            ]
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 1.3598770370389914)
```

### その他の検索クエリ

Geo Distance、Polygon Search、Wildcard、正規表現などの検索クエリを `search_options` パラメーターで使用できます。詳細については、ドキュメントを参照してください。

- [Couchbase Capella](https://docs.couchbase.com/cloud/search/search-request-params.html#query-object)
- [Couchbase Server](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)

# よくある質問

## 質問: `CouchbaseVectorStore` オブジェクトを作成する前に、検索インデックスを作成する必要がありますか?

はい、現在のところ `CouchbaseVectorStore` オブジェクトを作成する前に、検索インデックスを作成する必要があります。

## 質問: 検索結果にすべてのフィールドが表示されません。

Couchbaseでは、検索インデックスに格納されたフィールドのみを返すことができます。検索結果で試行しているフィールドが検索インデックスの一部であることを確認してください。

これを処理する1つの方法は、ドキュメントのフィールドをインデックスに動的にインデックス化および格納することです。

- Capellaでは、"高度モード"に移動し、チェブロンの "一般設定" の下で "[X] 動的フィールドを格納する" または "[X] 動的フィールドをインデックス化する" をチェックします。
- Couchbase Serverでは、インデックスエディター (クイックエディターではない) の "詳細" チェブロンの下で "[X] 動的フィールドを格納する" または "[X] 動的フィールドをインデックス化する" をチェックします。

動的マッピングの詳細については、[ドキュメント](https://docs.couchbase.com/cloud/search/customize-index.html)を参照してください。

## 質問: 検索結果に `metadata` オブジェクトが表示されません。

これは、ドキュメントの `metadata` フィールドがCouchbase検索インデックスでインデックス化および/または格納されていないためです。 `metadata` フィールドをインデックスに含めるには、子マッピングとして追加する必要があります。

マッピング内のすべてのフィールドをマップする場合、`metadata` のすべてのフィールドを検索できます。または、インデックスを最適化するために、`metadata` オブジェクト内の特定のフィールドをインデックス化することができます。子マッピングのインデックス化の詳細については、[ドキュメント](https://docs.couchbase.com/cloud/search/customize-index.html)を参照してください。

子マッピングの作成

* [Couchbase Capella](https://docs.couchbase.com/cloud/search/create-child-mapping.html)
* [Couchbase Server](https://docs.couchbase.com/server/current/search/create-child-mapping.html)
