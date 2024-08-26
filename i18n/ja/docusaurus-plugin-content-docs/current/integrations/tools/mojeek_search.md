---
translated: true
---

# Mojeek 検索

以下のノートブックでは、Mojeek 検索を使用して結果を取得する方法を説明します。 [Mojeek ウェブサイト](https://www.mojeek.com/services/search/web-search-api/) からAPIキーを取得してください。

```python
from langchain_community.tools import MojeekSearch
```

```python
api_key = "KEY"  # obtained from Mojeek Website
```

```python
search = MojeekSearch.config(api_key=api_key, search_kwargs={"t": 10})
```

`search_kwargs` には、[Mojeek ドキュメンテーション](https://www.mojeek.com/support/api/search/request_parameters.html) で見つかる検索パラメーターを追加できます。

```python
search.run("mojeek")
```
