---
translated: true
---

# 再帰的な URL

ルートディレクトリ以下のすべての URL を処理したい場合があります。

例えば、[Python 3.9 ドキュメント](https://docs.python.org/3.9/)を見てみましょう。

これには多くの興味深い子ページがあり、一括で読み込みたい場合があります。

もちろん、`WebBaseLoader`でページのリストを読み込むことができます。

しかし、子ページのツリーを横断し、そのリストを実際に組み立てるのが課題です!

これを行うのに `RecursiveUrlLoader` を使います。

これにより、一部の子ページを除外したり、抽出関数をカスタマイズしたりするなど、柔軟性が得られます。

# パラメータ

- url: str, クロールするターゲット URL。
- exclude_dirs: Optional[str], 除外するウェブページディレクトリ。
- use_async: Optional[bool], 非同期リクエストを使うかどうか。大規模なタスクでは非同期のほうが通常速いです。ただし、非同期にするとレイジーロードの機能は無効になります(関数は動作しますが、レイジーではありません)。デフォルトは False です。
- extractor: Optional[Callable[[str], str]], ウェブページからドキュメントのテキストを抽出する関数。デフォルトではページをそのまま返します。goose3 や beautifulsoup などのツールを使ってテキストを抽出することをお勧めします。デフォルトではページをそのまま返します。
- max_depth: Optional[int] = None, クロールする最大深さ。デフォルトは 2 です。ウェブサイト全体をクロールする必要がある場合は、十分な大きな数値を設定してください。
- timeout: Optional[int] = None, 各リクエストのタイムアウト(秒単位)。デフォルトは 10 秒です。
- prevent_outside: Optional[bool] = None, ルート URL 以外へのクロールを防ぐかどうか。デフォルトは True です。

```python
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
```

簡単な例を試してみましょう。

```python
from bs4 import BeautifulSoup as Soup

url = "https://docs.python.org/3.9/"
loader = RecursiveUrlLoader(
    url=url, max_depth=2, extractor=lambda x: Soup(x, "html.parser").text
)
docs = loader.load()
```

```python
docs[0].page_content[:50]
```

```output
'\n\n\n\n\nPython Frequently Asked Questions — Python 3.'
```

```python
docs[-1].metadata
```

```output
{'source': 'https://docs.python.org/3.9/library/index.html',
 'title': 'The Python Standard Library — Python 3.9.17 documentation',
 'language': None}
```

ただし、完璧なフィルタリングは難しいため、結果にはまだ関連性の低いものが含まれる可能性があります。必要に応じて、返された文書をさらにフィルタリングすることができます。ほとんどの場合、返された結果で十分です。

LangChain ドキュメントでテストしてみましょう。

```python
url = "https://js.langchain.com/docs/modules/memory/integrations/"
loader = RecursiveUrlLoader(url=url)
docs = loader.load()
len(docs)
```

```output
8
```
