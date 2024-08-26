---
translated: true
---

# サイトマップ

`WebBaseLoader`を拡張し、`SitemapLoader`はURLからサイトマップを読み込み、サイトマップ内のすべてのページをスクレイピングし、それぞれのページをDocumentとして返します。

スクレイピングは並行して行われます。デフォルトでは1秒あたり2リクエストの制限があります。良識的な利用者でない場合や、スクレイピング対象のサーバーを管理している場合、あるいはサーバーの負荷を気にしない場合は、この制限を引き上げることができます。ただし、スクレイピングのプロセスは高速化されますが、サーバーからブロックされる可能性もあるので注意が必要です。

```python
%pip install --upgrade --quiet  nest_asyncio
```

```python
# fixes a bug with asyncio and jupyter
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.sitemap import SitemapLoader
```

```python
sitemap_loader = SitemapLoader(web_path="https://api.python.langchain.com/sitemap.xml")

docs = sitemap_loader.load()
```

`requests_per_second`パラメータを変更して、最大並行リクエスト数を増やすことができます。また、`requests_kwargs`を使ってリクエストに追加のパラメータを渡すこともできます。

```python
sitemap_loader.requests_per_second = 2
# Optional: avoid `[SSL: CERTIFICATE_VERIFY_FAILED]` issue
sitemap_loader.requests_kwargs = {"verify": False}
```

```python
docs[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/stable/', 'loc': 'https://api.python.langchain.com/en/stable/', 'lastmod': '2024-02-09T01:10:49.422114+00:00', 'changefreq': 'weekly', 'priority': '1'})
```

## サイトマップURLのフィルタリング

サイトマップには数千もの URLが含まれることがあります。必要ないURLも多数あるでしょう。`filter_urls`パラメータに文字列のリストやRegex patternを渡すことで、それらのパターンに一致するURLのみをロードするようにフィルタリングできます。

```python
loader = SitemapLoader(
    web_path="https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest"],
)
documents = loader.load()
```

```python
documents[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/latest/', 'loc': 'https://api.python.langchain.com/en/latest/', 'lastmod': '2024-02-12T05:26:10.971077+00:00', 'changefreq': 'daily', 'priority': '0.9'})
```

## カスタムスクレイピングルールの追加

`SitemapLoader`は`beautifulsoup4`を使ってスクレイピングを行いますが、デフォルトではページ上のすべての要素をスクレイピングします。`SitemapLoader`のコンストラクタにはカスタムのスクレイピング関数を渡すことができます。この機能を使えば、ヘッダーやナビゲーション要素などをスクレイピングから除外するなど、スクレイピングプロセスをニーズに合わせてカスタマイズできます。

以下の例では、ナビゲーションとヘッダー要素を除外するためのカスタム関数を定義しています。

`beautifulsoup4`ライブラリをインポートし、カスタム関数を定義します。

```python
pip install beautifulsoup4
```

```python
from bs4 import BeautifulSoup


def remove_nav_and_header_elements(content: BeautifulSoup) -> str:
    # Find all 'nav' and 'header' elements in the BeautifulSoup object
    nav_elements = content.find_all("nav")
    header_elements = content.find_all("header")

    # Remove each 'nav' and 'header' element from the BeautifulSoup object
    for element in nav_elements + header_elements:
        element.decompose()

    return str(content.get_text())
```

定義したカスタム関数を`SitemapLoader`オブジェクトに追加します。

```python
loader = SitemapLoader(
    "https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest/"],
    parsing_function=remove_nav_and_header_elements,
)
```

## ローカルサイトマップ

サイトマップローダーはローカルファイルのロードにも使えます。

```python
sitemap_loader = SitemapLoader(web_path="example_data/sitemap.xml", is_local=True)

docs = sitemap_loader.load()
```
