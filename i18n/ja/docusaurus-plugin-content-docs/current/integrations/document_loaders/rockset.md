---
translated: true
---

# Rockset

> Rockset は、大規模な半構造化データに対して運用上の負担なしにクエリを実行できるリアルタイム分析データベースです。Rockset では、取り込まれたデータが1秒以内にクエリ可能になり、そのデータに対する分析クエリは通常ミリ秒単位で実行されます。Rockset はコンピューティング最適化されているため、100TB 未満の高コンカレンシーアプリケーションに適しています (100TB 以上の場合はロールアップを使用可能)。

このノートブックでは、Rockset をドキュメントローダーとして LangChain で使用する方法を示します。始めるには、Rockset アカウントと API キーが必要です。

## 環境設定

1. [Rockset コンソール](https://console.rockset.com/apikeys)にアクセスし、API キーを取得します。[API リファレンス](https://rockset.com/docs/rest-api/#introduction)から API リージョンを確認します。このノートブックでは、`Oregon(us-west-2)` を使用するものとします。
2. 環境変数 `ROCKSET_API_KEY` を設定します。
3. Rockset Python クライアントをインストールします。これは LangChain が Rockset データベースと連携するために使用されます。

```python
%pip install --upgrade --quiet  rockset
```

# ドキュメントの読み込み

LangChain の Rockset 統合により、SQL クエリを使ってRockset コレクションからドキュメントを読み込むことができます。これを行うには、`RocksetLoader` オブジェクトを構築する必要があります。以下のスニペットは `RocksetLoader` の初期化例です。

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 3"),  # SQL query
    ["text"],  # content columns
    metadata_keys=["id", "date"],  # metadata columns
)
```

ここでは、次のクエリが実行されています:

```sql
SELECT * FROM langchain_demo LIMIT 3
```

`text` 列がページコンテンツとして使用され、レコードの `id` と `date` 列がメタデータとして使用されます (`metadata_keys` に何も渡さない場合は、Rockset ドキュメント全体がメタデータとして使用されます)。

クエリを実行し、結果の `Document` オブジェクトのイテレータを取得するには、以下のように実行します:

```python
loader.lazy_load()
```

クエリを実行し、結果の `Document` オブジェクトをすべて一度に取得するには、以下のように実行します:

```python
loader.load()
```

`loader.load()` の例応答は以下のようになります:

```python
[
    Document(
        page_content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a libero porta, dictum ipsum eget, hendrerit neque. Morbi blandit, ex ut suscipit viverra, enim velit tincidunt tellus, a tempor velit nunc et ex. Proin hendrerit odio nec convallis lobortis. Aenean in purus dolor. Vestibulum orci orci, laoreet eget magna in, commodo euismod justo.",
        metadata={"id": 83209, "date": "2022-11-13T18:26:45.000000Z"}
    ),
    Document(
        page_content="Integer at finibus odio. Nam sit amet enim cursus lacus gravida feugiat vestibulum sed libero. Aenean eleifend est quis elementum tincidunt. Curabitur sit amet ornare erat. Nulla id dolor ut magna volutpat sodales fringilla vel ipsum. Donec ultricies, lacus sed fermentum dignissim, lorem elit aliquam ligula, sed suscipit sapien purus nec ligula.",
        metadata={"id": 89313, "date": "2022-11-13T18:28:53.000000Z"}
    ),
    Document(
        page_content="Morbi tortor enim, commodo id efficitur vitae, fringilla nec mi. Nullam molestie faucibus aliquet. Praesent a est facilisis, condimentum justo sit amet, viverra erat. Fusce volutpat nisi vel purus blandit, et facilisis felis accumsan. Phasellus luctus ligula ultrices tellus tempor hendrerit. Donec at ultricies leo.",
        metadata={"id": 87732, "date": "2022-11-13T18:49:04.000000Z"}
    )
]
```

## 複数の列をコンテンツとして使用する

複数の列をコンテンツとして使用することができます:

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],  # TWO content columns
)
```

"sentence1" フィールドが `"This is the first sentence."` で、"sentence2" フィールドが `"This is the second sentence."` の場合、結果の `Document` の `page_content` は以下のようになります:

```output
This is the first sentence.
This is the second sentence.
```

`content_columns_joiner` 引数を使って、独自の関数でコンテンツ列を結合することができます。`content_columns_joiner` は `List[Tuple[str, Any]]]` 型の引数を取る関数で、各列名と値のタプルのリストを表します。デフォルトでは、新しい行で各列値を結合する関数が使用されます。

例えば、sentence1 と sentence2 を空白で結合したい場合は、以下のように `content_columns_joiner` を設定できます:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: " ".join(
        [doc[1] for doc in docs]
    ),  # join with space instead of /n
)
```

結果の `Document` の `page_content` は以下のようになります:

```output
This is the first sentence. This is the second sentence.
```

多くの場合、列名を `page_content` に含めたい場合があります。以下のように実現できます:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: "\n".join(
        [f"{doc[0]}: {doc[1]}" for doc in docs]
    ),
)
```

この場合の `page_content` は以下のようになります:

```output
sentence1: This is the first sentence.
sentence2: This is the second sentence.
```
