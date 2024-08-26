---
translated: true
---

# メタル

>[メタル](https://github.com/getmetal/metal-python)は、MLエンベディングのためのマネージドサービスです。

このノートブックでは、[メタル](https://docs.getmetal.io/introduction)のリトリーバーの使用方法を示します。

まず、メタルに登録してAPIキーを取得する必要があります。[こちら](https://docs.getmetal.io/misc-create-app)から行うことができます。

```python
%pip install --upgrade --quiet  metal_sdk
```

```python
from metal_sdk.metal import Metal

API_KEY = ""
CLIENT_ID = ""
INDEX_ID = ""

metal = Metal(API_KEY, CLIENT_ID, INDEX_ID)
```

## ドキュメントの取り込み

インデックスがまだ設定されていない場合にのみ、この手順を行う必要があります。

```python
metal.index({"text": "foo1"})
metal.index({"text": "foo"})
```

```output
{'data': {'id': '642739aa7559b026b4430e42',
  'text': 'foo',
  'createdAt': '2023-03-31T19:51:06.748Z'}}
```

## クエリ

インデックスの設定が完了したら、リトリーバーを設定してクエリを開始できます。

```python
from langchain_community.retrievers import MetalRetriever
```

```python
retriever = MetalRetriever(metal, params={"limit": 2})
```

```python
retriever.invoke("foo1")
```

```output
[Document(page_content='foo1', metadata={'dist': '1.19209289551e-07', 'id': '642739a17559b026b4430e40', 'createdAt': '2023-03-31T19:50:57.853Z'}),
 Document(page_content='foo1', metadata={'dist': '4.05311584473e-06', 'id': '642738f67559b026b4430e3c', 'createdAt': '2023-03-31T19:48:06.769Z'})]
```
