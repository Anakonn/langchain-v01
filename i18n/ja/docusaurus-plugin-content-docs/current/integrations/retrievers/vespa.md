---
translated: true
---

# ベスパ

>[ベスパ](https://vespa.ai/) は、完全装備の検索エンジンおよびベクターデータベースです。ベクター検索 (ANN)、レキシカル検索、構造化データの検索をすべて同じクエリでサポートします。

このノートブックは、`Vespa.ai` を LangChain リトリーバーとして使用する方法を示しています。

リトリーバーを作成するために、[pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) を使用して
`Vespa` サービスへの接続を作成します。

```python
%pip install --upgrade --quiet  pyvespa
```

```python
from vespa.application import Vespa

vespa_app = Vespa(url="https://doc-search.vespa.oath.cloud")
```

これは `Vespa` サービス、ここでは Vespa ドキュメント検索サービスへの接続を作成します。
`pyvespa` パッケージを使用すると、
[Vespa Cloud インスタンス](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
またはローカルの
[Docker インスタンス](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html)
にも接続できます。

サービスに接続した後、リトリーバーを設定できます：

```python
from langchain_community.retrievers import VespaRetriever

vespa_query_body = {
    "yql": "select content from paragraph where userQuery()",
    "hits": 5,
    "ranking": "documentation",
    "locale": "en-us",
}
vespa_content_field = "content"
retriever = VespaRetriever(vespa_app, vespa_query_body, vespa_content_field)
```

これは Vespa アプリケーションからドキュメントを取得する LangChain リトリーバーを設定します。
ここでは、`paragraph` ドキュメントタイプの `content` フィールドから最大5件の結果を取得し、
`doucmentation` をランク付けの方法として使用します。`userQuery()` は LangChain から渡される実際のクエリに置き換えられます。

詳細については [pyvespa ドキュメント](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query) を参照してください。

これで結果を返し、LangChain で結果を使用し続けることができます。

```python
retriever.invoke("what is vespa?")
```
