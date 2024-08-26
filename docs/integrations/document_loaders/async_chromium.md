---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/async_chromium
translated: false
---

# Async Chromium

Chromium is one of the browsers supported by Playwright, a library used to control browser automation.

By running `p.chromium.launch(headless=True)`, we are launching a headless instance of Chromium.

Headless mode means that the browser is running without a graphical user interface.

`AsyncChromiumLoader` loads the page, and then we use `Html2TextTransformer` to transform to text.

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

If you are using Jupyter notebooks, you might need to apply `nest_asyncio` before loading the documents.

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