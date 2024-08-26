---
translated: true
---

# ウィキペディア

>[ウィキペディア](https://wikipedia.org/)は、ボランティアの共同体であるウィキペディアンによって書かれ、維持されている多言語の無料のオンライン百科事典で、MediaWikiと呼ばれるウィキベースの編集システムを使用しています。ウィキペディアは、歴史上最大で最も読まれている参考文献です。

このノートブックでは、`wikipedia.org`からウィキページをDocument形式にロードする方法を示します。

## インストール

まず、`wikipedia`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  wikipedia
```

## 例

`WikipediaLoader`には以下の引数があります:
- `query`: ウィキペディアで文書を検索するための自由テキスト
- オプションの `lang`: デフォルト="en"。特定の言語のウィキペディアを検索するために使用します
- オプションの `load_max_docs`: デフォルト=100。ダウンロードする文書数を制限するために使用します。100件の文書をすべてダウンロードするのに時間がかかるので、実験には小さな数値を使用してください。現在の上限は300件です。
- オプションの `load_all_available_meta`: デフォルト=False。デフォルトでは、最も重要なフィールドのみがダウンロードされます: `Published`(文書が公開/最終更新された日付)、`title`、`Summary`。Trueの場合、他のフィールドもダウンロードされます。

```python
from langchain_community.document_loaders import WikipediaLoader
```

```python
docs = WikipediaLoader(query="HUNTER X HUNTER", load_max_docs=2).load()
len(docs)
```

```python
docs[0].metadata  # meta-information of the Document
```

```python
docs[0].page_content[:400]  # a content of the Document
```
