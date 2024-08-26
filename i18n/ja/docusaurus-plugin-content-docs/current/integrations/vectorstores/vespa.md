---
translated: true
---

# ベスパ

>[ベスパ](https://vespa.ai/) は完全な機能を備えた検索エンジンおよびベクトルデータベースです。ベクトル検索（ANN）、語彙検索、および構造化データの検索を同じクエリでサポートします。

このノートブックでは、`Vespa.ai` を LangChain ベクトルストアとして使用する方法を示します。

ベクトルストアを作成するには、
[pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) を使用して `Vespa` サービスに接続します。

```python
%pip install --upgrade --quiet  pyvespa
```

`pyvespa` パッケージを使用して、
[ベスパクラウドインスタンス](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
またはローカルの
[Dockerインスタンス](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html) に接続できます。ここでは、新しいベスパアプリケーションを作成し、それを Docker を使用してデプロイします。

#### ベスパアプリケーションの作成

まず、アプリケーションパッケージを作成する必要があります：

```python
from vespa.package import ApplicationPackage, Field, RankProfile

app_package = ApplicationPackage(name="testapp")
app_package.schema.add_fields(
    Field(
        name="text", type="string", indexing=["index", "summary"], index="enable-bm25"
    ),
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary"],
        attribute=["distance-metric: angular"],
    ),
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="default",
        first_phase="closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

これにより、ドキュメントごとに 2 つのフィールドを含むスキーマを持つベスパアプリケーションがセットアップされます。`text` フィールドはドキュメントテキストを保持するためのもので、`embedding` フィールドは埋め込みベクトルを保持するためのものです。`text` フィールドは効率的なテキスト検索のために BM25 インデックスを使用するように設定されており、これを使用してハイブリッド検索を行う方法は後で説明します。

`embedding` フィールドは、テキストの埋め込み表現を保持するために長さ 384 のベクトルで設定されています。ベスパのテンソルについての詳細は
[Vespa's Tensor Guide](https://docs.vespa.ai/en/tensor-user-guide.html) を参照してください。

最後に、[ランクプロファイル](https://docs.vespa.ai/en/ranking.html) を追加して、ベスパがドキュメントの順序を決定する方法を指示します。ここでは、[近傍検索](https://docs.vespa.ai/en/nearest-neighbor-search.html) を使用するように設定します。

これで、このアプリケーションをローカルにデプロイできます：

```python
from vespa.deployment import VespaDocker

vespa_docker = VespaDocker()
vespa_app = vespa_docker.deploy(application_package=app_package)
```

これにより、`Vespa` サービスへの接続がデプロイおよび作成されます。クラウドなどに既にベスパアプリケーションが実行されている場合は、接続方法について PyVespa アプリケーションを参照してください。

#### ベスパベクトルストアの作成

次に、いくつかのドキュメントを読み込みます：

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

ここでは、テキストを埋め込みベクトルに変換するためのローカル文エンベッダーもセットアップします。OpenAI 埋め込みを使用することもできますが、その埋め込みのより大きなサイズを反映するためにベクトルの長さを `1536` に更新する必要があります。

これらをベスパにフィードするには、ベクトルストアがベスパアプリケーション内のフィールドにマップする方法を構成する必要があります。次に、このドキュメントセットから直接ベクトルストアを作成します：

```python
vespa_config = dict(
    page_content_field="text",
    embedding_field="embedding",
    input_field="query_embedding",
)

from langchain_community.vectorstores import VespaStore

db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

これにより、ベスパベクトルストアが作成され、そのドキュメントセットがベスパにフィードされます。ベクトルストアは各ドキュメントの埋め込み関数を呼び出し、それらをデータベースに挿入する役割を担います。

これで、ベクトルストアにクエリを実行できます：

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)

print(results[0].page_content)
```

これにより、クエリの表現を作成するために上記の埋め込み関数が使用され、ベスパで検索が実行されます。これはアプリケーションパッケージで設定した `default` ランキング関数を使用します。`similarity_search` の `ranking` 引数を使用して、使用するランキング関数を指定できます。

詳細については、[pyvespa documentation](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query) を参照してください。

これで、LangChain でのベスパストアの基本的な使用方法について説明しました。結果を返し、LangChain でこれらを使用し続けることができます。

#### ドキュメントの更新

`from_documents` を呼び出す代わりに、ベクトルストアを直接作成し、`add_texts` を呼び出すこともできます。これを使用してドキュメントを更新することもできます：

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
result = results[0]

result.page_content = "UPDATED: " + result.page_content
db.add_texts([result.page_content], [result.metadata], result.metadata["id"])

results = db.similarity_search(query)
print(results[0].page_content)
```

ただし、`pyvespa` ライブラリにはベスパ上のコンテンツを操作する方法が含まれており、それを直接使用することができます。

#### ドキュメントの削除

`delete` 関数を使用してドキュメントを削除できます：

```python
result = db.similarity_search(query)
# docs[0].metadata["id"] == "id:testapp:testapp::32"

db.delete(["32"])
result = db.similarity_search(query)
# docs[0].metadata["id"] != "id:testapp:testapp::32"
```

再度、`pyvespa` 接続にはドキュメントを削除するためのメソッドも含まれています。

### スコア付きの返却

`similarity_search` メソッドは関連性の順序でドキュメントのみを返します。実際のスコアを取得するには：

```python
results = db.similarity_search_with_score(query)
result = results[0]
# result[1] ~= 0.463
```

これは `"all-MiniLM-L6-v2"` 埋め込みモデルをコサイン距離関数（アプリケーション関数の引数 `angular` により与えられる）を使用している結果です。

異なる埋め込み関数には異なる距離関数が必要であり、ベスパはドキュメントの順序を決定する際に使用する距離関数を知る必要があります。詳細については、
[documentation on distance functions](https://docs.vespa.ai/en/reference/schema-reference.html#distance-metric) を参照してください。

### レトリーバーとして

このベクトルストアを
[LangChain レトリーバー](/docs/modules/data_connection/retrievers/) として使用するには、標準のベクトルストアメソッドである `as_retriever` 関数を呼び出すだけです：

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
retriever = db.as_retriever()
query = "What did the president say about Ketanji Brown Jackson"
results = retriever.invoke(query)

# results[0].metadata["id"] == "id:testapp:testapp::32"
```

これにより、ベクトルストアからのより一般的で非構造化の検索が可能になります。

### メタデータ

これまでの例では、テキストとその埋め込みのみを使用してきました。ドキュメントには通常、LangChain ではメタデータと呼ばれる追加情報が含まれています。

ベスパはアプリケーションパッケージにこれらを追加することで、異なるタイプの多くのフィールドを含むことができます：

```python
app_package.schema.add_fields(
    # ...
    Field(name="date", type="string", indexing=["attribute", "summary"]),
    Field(name="rating", type="int", indexing=["attribute", "summary"]),
    Field(name="author", type="string", indexing=["attribute", "summary"]),
    # ...
)
vespa_app = vespa_docker.deploy(application_package=app_package)
```

ドキュメントにいくつかのメタデータフィールドを追加できます：

```python
# Add metadata
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"2023-{(i % 12)+1}-{(i % 28)+1}"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["Joe Biden", "Unknown"][min(i, 1)]
```

そして、これらのフィールドについてベスパベクトルストアに知らせます：

```python
vespa_config.update(dict(metadata_fields=["date", "rating", "author"]))
```

これで、これらのドキュメントを検索する際に、これらのフィールドが返されます。また、これらのフィールドでフィルタリングすることもできます：

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, filter="rating > 3")
# results[0].metadata["id"] == "id:testapp:testapp::34"
# results[0].metadata["author"] == "Unknown"
```

### カスタムクエリ

similarity search のデフォルトの動作が要件に合わない場合は、常に独自のクエリを提供できます。そのため、ベクトルストアに全ての設定を提供する必要はなく、自分でこれを書くだけで済みます。

まず、BM25 ランキング関数をアプリケーションに追加します：

```python
from vespa.package import FieldSet

app_package.schema.add_field_set(FieldSet(name="default", fields=["text"]))
app_package.schema.add_rank_profile(RankProfile(name="bm25", first_phase="bm25(text)"))
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

次に、BM25 に基づく通常のテキスト検索を実行します：

```python
query = "What did the president say about Ketanji Brown Jackson"
custom_query = {
    "yql": "select * from sources * where userQuery()",
    "query": query,
    "type": "weakAnd",
    "ranking": "bm25",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"] == "id:testapp:testapp::32"
# results[0][1] ~= 14.384
```

ベスパの強力な検索およびクエリ機能は、カスタムクエリを使用することで利用できます。詳細については、ベスパの
[Query API](https://docs.vespa.ai/en/query-api.html) に関するドキュメントを参照してください。

### ハイブリッド検索

ハイブリッド検索は、BM25 のようなクラシックな用語ベースの検索とベクトル検索の両方を使用し、結果を組み合わせることを意味します。ベスパでハイブリッド検索用の新しいランクプロファイルを作成する必要があります：

```python
app_package.schema.add_rank_profile(
    RankProfile(
        name="hybrid",
        first_phase="log(bm25(text)) + 0.5 * closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

ここでは、各ドキュメントを BM25 スコアと距離スコアの組み合わせとしてスコアリングします。カスタムクエリを使用してクエリを実行できます：

```python
query = "What did the president say about Ketanji Brown Jackson"
query_embedding = embedding_function.embed_query(query)
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(embedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression} and userQuery()",
    "query": query,
    "type": "weakAnd",
    "input.query(query_embedding)": query_embedding,
    "ranking": "hybrid",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 2.897
```

### ベスパのネイティブエンベッダー

これまでのところ、テキストに埋め込みを提供するために Python の埋め込み関数を使用してきました。ベスパはネイティブに埋め込み関数をサポートしているため、この計算をベスパに任せることができます。利点の1つは、大規模なコレクションを持っている場合に GPU を使用してドキュメントを埋め込む能力です。

詳細については、[Vespa embeddings](https://docs.vespa.ai/en/embedding.html) を参照してください。

まず、アプリケーションパッケージを変更する必要があります：

```python
from vespa.package import Component, Parameter

app_package.components = [
    Component(
        id="hf-embedder",
        type="hugging-face-embedder",
        parameters=[
            Parameter("transformer-model", {"path": "..."}),
            Parameter("tokenizer-model", {"url": "..."}),
        ],
    )
]
Field(
    name="hfembedding",
    type="tensor<float>(x[384])",
    is_document_field=False,
    indexing=["input text", "embed hf-embedder", "attribute", "summary"],
    attribute=["distance-metric: angular"],
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="hf_similarity",
        first_phase="closeness(field, hfembedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

埋め込みモデルとトークナイザーをアプリケーションに追加する方法については、埋め込みドキュメントを参照してください。`hfembedding` フィールドには、`hf-embedder` を使用した埋め込みに関する指示が含まれています。

これで、カスタムクエリを使用してクエリを実行できます：

```python
query = "What did the president say about Ketanji Brown Jackson"
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(internalembedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression}",
    "input.query(query_embedding)": f'embed(hf-embedder, "{query}")',
    "ranking": "internal_similarity",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 0.630
```

ここでのクエリには、ドキュメントと同じモデルを使用してクエリを埋め込む `embed` 指示が含まれています。

### 近似近傍

上記の例ではすべて、正確な近傍検索を使用して結果を見つけました。しかし、大規模なドキュメントコレクションの場合、すべてのドキュメントをスキャンして最適な一致を見つけるのは現実的ではありません。これを避けるために、
[近似近傍](https://docs.vespa.ai/en/approximate-nn-hnsw.html) を使用できます。

まず、埋め込みフィールドを変更して HNSW インデックスを作成します：

```python
from vespa.package import HNSW

app_package.schema.add_fields(
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary", "index"],
        ann=HNSW(
            distance_metric="angular",
            max_links_per_node=16,
            neighbors_to_explore_at_insert=200,
        ),
    )
)
```

これにより埋め込みデータに HNSW インデックスが作成され、効率的な検索が可能になります。これで、`approximate` 引数を `True` に設定することで、簡単に ANN を使用して検索できます：

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, approximate=True)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
```

これで、LangChain におけるベスパベクトルストアの機能のほとんどを網羅しました。
