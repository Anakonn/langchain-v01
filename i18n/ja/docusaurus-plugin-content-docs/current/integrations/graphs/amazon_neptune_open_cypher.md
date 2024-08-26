---
translated: true
---

# Amazon Neptune with Cypher

>[Amazon Neptune](https://aws.amazon.com/neptune/)は、優れたスケーラビリティとアベイラビリティを備えたハイパフォーマンスのグラフ分析およびサーバーレスデータベースです。
>
>この例では、`Neptune`グラフデータベースを`openCypher`を使用してクエリし、人間が読みやすい応答を返す QA チェーンを示しています。
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))は、プロパティグラフでデータを効率的にクエリできる宣言型のグラフクエリ言語です。
>
>[openCypher](https://opencypher.org/)は、Cypherのオープンソース実装です。# Neptune Open Cypher QA Chain
このQAチェーンは、openCypherを使ってAmazon Neptuneをクエリし、人間が読みやすい応答を返します。

LangChainは、`NeptuneOpenCypherQAChain`を使って[Neptune Database](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html)と[Neptune Analytics](https://docs.aws.amazon.com/neptune-analytics/latest/userguide/what-is-neptune-analytics.html)の両方をサポートしています。

Neptune Databaseは、最適なスケーラビリティとアベイラビリティを備えたサーバーレスのグラフデータベースです。1秒あたり10万クエリ、マルチAZ高可用性、マルチリージョンデプロイメントに対応しています。ソーシャルネットワーク、不正検知、顧客360アプリケーションなどのグラフデータベースワークロードに適しています。

Neptune Analyticsは、メモリ内で大量のグラフデータを高速に分析し、洞察を得るためのアナリティクスデータベースエンジンです。既存のグラフデータベースやデータレイクに保存されたグラフデータセットを迅速に分析するソリューションです。人気のグラフ分析アルゴリズムと低レイテンシのアナリティクスクエリを使用しています。

## Neptune Databaseの使用

```python
from langchain_community.graphs import NeptuneGraph

host = "<neptune-host>"
port = 8182
use_https = True

graph = NeptuneGraph(host=host, port=port, use_https=use_https)
```

### Neptune Analyticsの使用

```python
from langchain_community.graphs import NeptuneAnalyticsGraph

graph = NeptuneAnalyticsGraph(graph_identifier="<neptune-analytics-graph-id>")
```

## NeptuneOpenCypherQAChainの使用

このQAチェーンは、openCypherを使ってNeptuneグラフデータベースをクエリし、人間が読みやすい応答を返します。

```python
from langchain.chains import NeptuneOpenCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-4")

chain = NeptuneOpenCypherQAChain.from_llm(llm=llm, graph=graph)

chain.invoke("how many outgoing routes does the Austin airport have?")
```

```output
'The Austin airport has 98 outgoing routes.'
```
