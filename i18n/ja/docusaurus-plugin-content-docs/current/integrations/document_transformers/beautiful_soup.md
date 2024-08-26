---
translated: true
---

# Beautiful Soup

>[Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/)は、HTMLやXMLドキュメント(不完全なマークアップ、つまり閉じられていないタグを含む)を解析するためのPythonパッケージです。
>解析されたページからデータを抽出するのに役立つ解析ツリーを作成します。[3]

`Beautiful Soup`は、HTMLコンテンツに対して細かい制御を可能にし、特定のタグの抽出、削除、コンテンツのクリーニングができます。

特定の情報を抽出し、ニーズに合わせてHTMLコンテンツをクリーンアップする場合に適しています。

例えば、HTMLコンテンツから`<p>、<li>、<div>、<a>`タグ内のテキストコンテンツをスクレイピングできます:

* `<p>`: 段落タグ。HTMLで段落を定義し、関連する文章や句を一緒にグループ化するのに使用されます。

* `<li>`: リスト項目タグ。順序付きリスト(`<ol>`)と順序なしリスト(`<ul>`)内で個々の項目を定義するのに使用されます。

* `<div>`: 分割タグ。他のインラインまたはブロックレベルの要素をグループ化するためのブロックレベルの要素です。

* `<a>`: アンカータグ。ハイパーリンクを定義するのに使用されます。

```python
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```

```python
# Transform
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(
    html, tags_to_extract=["p", "li", "div", "a"]
)
```

```python
docs_transformed[0].page_content[0:500]
```

```output
'Conservative legal activists are challenging Amazon, Comcast and others using many of the same tools that helped kill affirmative-action programs in colleges.1,2099 min read U.S. stock indexes fell and government-bond prices climbed, after Moody’s lowered credit ratings for 10 smaller U.S. banks and said it was reviewing ratings for six larger ones. The Dow industrials dropped more than 150 points.3 min read Penn Entertainment’s Barstool Sportsbook app will be rebranded as ESPN Bet this fall as '
```
