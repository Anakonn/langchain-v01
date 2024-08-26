---
translated: true
---

# Neo4j ベクトルインデックス

>[Neo4j](https://neo4j.com/)は、ベクトル類似検索を統合サポートする、オープンソースのグラフデータベースです。

以下をサポートしています:

- 近似最近傍検索
- ユークリッド距離とコサイン類似度
- ベクトルとキーワード検索を組み合わせたハイブリッド検索

このノートブックでは、Neo4jベクトルインデックス(`Neo4jVector`)の使用方法を示します。

[インストール手順](https://neo4j.com/docs/operations-manual/current/installation/)を参照してください。

```python
# Pip install necessary package
%pip install --upgrade --quiet  neo4j
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  tiktoken
```

`OpenAIEmbeddings`を使用するには、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Neo4jVector
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
# Neo4jVector requires the Neo4j database credentials

url = "bolt://localhost:7687"
username = "neo4j"
password = "password"

# You can also use environment variables instead of directly passing named parameters
# os.environ["NEO4J_URI"] = "bolt://localhost:7687"
# os.environ["NEO4J_USERNAME"] = "neo4j"
# os.environ["NEO4J_PASSWORD"] = "pleaseletmein"
```

## コサイン距離によるシミラリティ検索 (デフォルト)

```python
# The Neo4jVector Module will connect to Neo4j and create a vector index if needed.

db = Neo4jVector.from_documents(
    docs, OpenAIEmbeddings(), url=url, username=username, password=password
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query, k=2)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.9076391458511353
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.8912242650985718
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

## ベクトルストアの操作

上記では、ベクトルストアを新規作成しました。しかし、多くの場合、既存のベクトルストアを使用したいことがあります。
そのためには、直接初期化することができます。

```python
index_name = "vector"  # default index name

store = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=index_name,
)
```

また、`from_existing_graph`メソッドを使って、既存のグラフからベクトルストアを初期化することもできます。このメソッドは、データベースから関連するテキスト情報を取得し、テキストエンベディングをデータベースに計算して保存します。

```python
# First we create sample data in graph
store.query(
    "CREATE (p:Person {name: 'Tomaz', location:'Slovenia', hobby:'Bicycle', age: 33})"
)
```

```output
[]
```

```python
# Now we initialize from existing graph
existing_graph = Neo4jVector.from_existing_graph(
    embedding=OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    node_label="Person",
    text_node_properties=["name", "location"],
    embedding_node_property="embedding",
)
result = existing_graph.similarity_search("Slovenia", k=1)
```

```python
result[0]
```

```output
Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})
```

Neo4jはまた、リレーションシップベクトルインデックスもサポートしています。ここでは、エンベディングがリレーションシッププロパティとして保存され、インデックス化されます。リレーションシップベクトルインデックスは、LangChainからは設定できませんが、既存のリレーションシップベクトルインデックスに接続することができます。

```python
# First we create sample data and index in graph
store.query(
    "MERGE (p:Person {name: 'Tomaz'}) "
    "MERGE (p1:Person {name:'Leann'}) "
    "MERGE (p1)-[:FRIEND {text:'example text', embedding:$embedding}]->(p2)",
    params={"embedding": OpenAIEmbeddings().embed_query("example text")},
)
# Create a vector index
relationship_index = "relationship_vector"
store.query(
    """
CREATE VECTOR INDEX $relationship_index
IF NOT EXISTS
FOR ()-[r:FRIEND]-() ON (r.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}}
""",
    params={"relationship_index": relationship_index},
)
```

```output
[]
```

```python
relationship_vector = Neo4jVector.from_existing_relationship_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=relationship_index,
    text_node_property="text",
)
relationship_vector.similarity_search("Example")
```

```output
[Document(page_content='example text')]
```

### メタデータフィルタリング

Neo4jベクトルストアは、並列実行時間と正確な最近傍検索を組み合わせることで、メタデータフィルタリングもサポートしています。
_Neo4j 5.18以降のバージョンが必要です。_

等価フィルタリングの構文は以下のとおりです。

```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"hobby": "Bicycle", "name": "Tomaz"},
)
```

```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```

メタデータフィルタリングでは、以下のオペレータもサポートされています:

* `$eq: 等しい`
* `$ne: 等しくない`
* `$lt: より小さい`
* `$lte: 以下`
* `$gt: より大きい`
* `$gte: 以上`
* `$in: リストに含まれる`
* `$nin: リストに含まれない`
* `$between: 2つの値の間`
* `$like: テキストに値が含まれる`
* `$ilike: 小文字のテキストに値が含まれる`

```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"hobby": {"$eq": "Bicycle"}, "age": {"$gt": 15}},
)
```

```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```

フィルタの間に`OR`演算子を使うこともできます。

```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"$or": [{"hobby": {"$eq": "Bicycle"}}, {"age": {"$gt": 15}}]},
)
```

```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```

### ドキュメントの追加

既存のベクトルストアにドキュメントを追加することができます。

```python
store.add_documents([Document(page_content="foo")])
```

```output
['acbd18db4cc2f85cedef654fccc4a4d8']
```

```python
docs_with_score = store.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```

```output
(Document(page_content='foo'), 0.9999997615814209)
```

## 検索クエリでレスポンスをカスタマイズ

グラフから他の情報を取得するためのカスタムCypherスニペットを使って、レスポンスをカスタマイズすることもできます。
内部的には、最終的なCypherステートメントは以下のように構築されます:

```python
read_query = (
  "CALL db.index.vector.queryNodes($index, $k, $embedding) "
  "YIELD node, score "
) + retrieval_query
```

検索クエリは、以下の3つの列を返す必要があります:

* `text`: Union[str, Dict] = ドキュメントの`page_content`に使用される値
* `score`: Float = 類似度スコア
* `metadata`: Dict = ドキュメントの追加メタデータ

詳細は[このブログ記事](https://medium.com/neo4j/implementing-rag-how-to-write-a-graph-retrieval-query-in-langchain-74abf13044f2)を参照してください。

```python
retrieval_query = """
RETURN "Name:" + node.name AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1)
```

```output
[Document(page_content='Name:Tomaz', metadata={'foo': 'bar'})]
```

`embedding`以外のすべてのノードプロパティをディクショナリとして`text`列に渡す例は以下のとおりです。

```python
retrieval_query = """
RETURN node {.name, .age, .hobby} AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1)
```

```output
[Document(page_content='name: Tomaz\nage: 33\nhobby: Bicycle\n', metadata={'foo': 'bar'})]
```

クエリパラメータを検索クエリに渡すこともできます。
パラメータは、追加のフィルタリング、トラバーサルなどに使用できます。

```python
retrieval_query = """
RETURN node {.*, embedding:Null, extra: $extra} AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1, params={"extra": "ParamInfo"})
```

```output
[Document(page_content='location: Slovenia\nextra: ParamInfo\nname: Tomaz\nage: 33\nhobby: Bicycle\nembedding: None\n', metadata={'foo': 'bar'})]
```

## ハイブリッド検索 (ベクトル + キーワード)

Neo4jは、ベクトルインデックスとキーワードインデックスの両方を統合しているため、ハイブリッド検索アプローチを使用できます。

```python
# The Neo4jVector Module will connect to Neo4j and create a vector and keyword indices if needed.
hybrid_db = Neo4jVector.from_documents(
    docs,
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    search_type="hybrid",
)
```

既存のインデックスからハイブリッド検索をロードするには、ベクトルインデックスとキーワードインデックスの両方を提供する必要があります。

```python
index_name = "vector"  # default index name
keyword_index_name = "keyword"  # default keyword index name

store = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=index_name,
    keyword_index_name=keyword_index_name,
    search_type="hybrid",
)
```

## リトリーバーオプション

このセクションでは、`Neo4jVector`をリトリーバーとして使用する方法を示します。

```python
retriever = store.as_retriever()
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'})
```

## ソースを含む質問応答

このセクションでは、インデックスを使った質問応答とソースの取得について説明します。これは、ドキュメントをインデックスから検索する`RetrievalQAWithSourcesChain`を使って行います。

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_openai import ChatOpenAI
```

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    ChatOpenAI(temperature=0), chain_type="stuff", retriever=retriever
)
```

```python
chain.invoke(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
{'answer': 'The president honored Justice Stephen Breyer for his service to the country and mentioned his retirement from the United States Supreme Court.\n',
 'sources': '../../modules/state_of_the_union.txt'}
```
