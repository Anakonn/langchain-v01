---
translated: true
---

# ゴールデン クエリ

>[ゴールデン](https://golden.com)は、ゴールデン・ナレッジ・グラフを使用したクエリと強化のための一連の自然言語 API を提供しています。例えば、`OpenAI の製品`、`シリーズ A ファンディングを受けた生成 AI 企業`、`投資をするラッパー`などのクエリを使用して、関連するエンティティに関する構造化データを取得できます。

>`golden-query` Langchain ツールは、[ゴールデン クエリ API](https://docs.golden.com/reference/query-api)のラッパーであり、これらの結果にプログラムで アクセスできるようにします。
>[ゴールデン クエリ API のドキュメント](https://docs.golden.com/reference/query-api)で詳細を確認してください。

このノートブックでは、`golden-query` ツールの使用方法を説明します。

- [ゴールデン API のドキュメント](https://docs.golden.com/)に行って、ゴールデン API の概要を確認してください。
- [ゴールデン API の設定](https://golden.com/settings/api)ページから API キーを取得してください。
- API キーを GOLDEN_API_KEY 環境変数に保存してください。

```python
import os

os.environ["GOLDEN_API_KEY"] = ""
```

```python
from langchain_community.utilities.golden_query import GoldenQueryAPIWrapper
```

```python
golden_query = GoldenQueryAPIWrapper()
```

```python
import json

json.loads(golden_query.run("companies in nanotech"))
```

```output
{'results': [{'id': 4673886,
   'latestVersionId': 60276991,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Samsung', 'citations': []}]}]},
  {'id': 7008,
   'latestVersionId': 61087416,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Intel', 'citations': []}]}]},
  {'id': 24193,
   'latestVersionId': 60274482,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Texas Instruments', 'citations': []}]}]},
  {'id': 1142,
   'latestVersionId': 61406205,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Advanced Micro Devices', 'citations': []}]}]},
  {'id': 193948,
   'latestVersionId': 58326582,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Freescale Semiconductor', 'citations': []}]}]},
  {'id': 91316,
   'latestVersionId': 60387380,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Agilent Technologies', 'citations': []}]}]},
  {'id': 90014,
   'latestVersionId': 60388078,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Novartis', 'citations': []}]}]},
  {'id': 237458,
   'latestVersionId': 61406160,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Analog Devices', 'citations': []}]}]},
  {'id': 3941943,
   'latestVersionId': 60382250,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'AbbVie Inc.', 'citations': []}]}]},
  {'id': 4178762,
   'latestVersionId': 60542667,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'IBM', 'citations': []}]}]}],
 'next': 'https://golden.com/api/v2/public/queries/59044/results/?cursor=eyJwb3NpdGlvbiI6IFsxNzYxNiwgIklCTS04M1lQM1oiXX0%3D&pageSize=10',
 'previous': None}
```
