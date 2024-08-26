---
translated: true
---

# NucliaDB

ローカルのNucliaDBインスタンスを使用するか、[Nuclia Cloud](https://nuclia.cloud)を使用できます。

ローカルのインスタンスを使用する場合、テキストが適切にベクトル化およびインデックス化されるように、Nuclia Understanding APIキーが必要です。[https://nuclia.cloud](https://nuclia.cloud)で無料アカウントを作成し、[NUAキーを作成](https://docs.nuclia.dev/docs/docs/using/understanding/intro)することでキーを取得できます。

```python
%pip install --upgrade --quiet  langchain nuclia
```

## Nuclia.cloudでの使用方法

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

API_KEY = "YOUR_API_KEY"

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=False, api_key=API_KEY)
```

## ローカルインスタンスでの使用方法

注意: デフォルトでは `backend` は `http://localhost:8080` に設定されています。

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=True, backend="http://my-local-server")
```

## Knowledge Boxにテキストを追加および削除する

```python
ids = ndb.add_texts(["This is a new test", "This is a second test"])
```

```python
ndb.delete(ids=ids)
```

## Knowledge Boxを検索する

```python
results = ndb.similarity_search("Who was inspired by Ada Lovelace?")
print(results[0].page_content)
```
