---
translated: true
---

# Async Chromium

Chromiumは、ブラウザ自動化に使用されるライブラリPlaywrightでサポートされているブラウザの1つです。

`p.chromium.launch(headless=True)`を実行することで、Chromiumのヘッドレスインスタンスを起動しています。

ヘッドレスモードとは、ブラウザがグラフィカルユーザーインターフェイスなしで実行されることを意味します。

`AsyncChromiumLoader`がページを読み込み、その後`Html2TextTransformer`を使ってテキストに変換します。

```python
%pip install --upgrade --quiet  playwright beautifulsoup4
!playwright install
```

```python
from langchain_community.document_loaders import AsyncChromiumLoader

urls = ["https://www.wsj.com"]
loader = AsyncChromiumLoader(urls)
docs = loader.load()
docs[0].page_content[0:100]
```

```output
'<!DOCTYPE html><html lang="en"><head><script src="https://s0.2mdn.net/instream/video/client.js" asyn'
```

Jupyter notebooksを使用している場合は、ドキュメントを読み込む前に`nest_asyncio`を適用する必要があるかもしれません。

```python
!pip install nest-asyncio
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
docs_transformed[0].page_content[0:500]
```

```output
"Skip to Main ContentSkip to SearchSkip to... Select * Top News * What's News *\nFeatured Stories * Retirement * Life & Arts * Hip-Hop * Sports * Video *\nEconomy * Real Estate * Sports * CMO * CIO * CFO * Risk & Compliance *\nLogistics Report * Sustainable Business * Heard on the Street * Barron’s *\nMarketWatch * Mansion Global * Penta * Opinion * Journal Reports * Sponsored\nOffers Explore Our Brands * WSJ * * * * * Barron's * * * * * MarketWatch * * *\n* * IBD # The Wall Street Journal SubscribeSig"
```
