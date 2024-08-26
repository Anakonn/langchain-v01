---
translated: true
---

# 비동기 크로미엄

크로미엄은 브라우저 자동화를 위해 사용되는 라이브러리인 Playwright에서 지원되는 브라우저 중 하나입니다.

`p.chromium.launch(headless=True)`를 실행하면 크로미엄의 무화면 인스턴스를 실행합니다.

무화면 모드는 브라우저가 그래픽 사용자 인터페이스 없이 실행되는 것을 의미합니다.

`AsyncChromiumLoader`가 페이지를 로드하고, 그 후 `Html2TextTransformer`를 사용하여 텍스트로 변환합니다.

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

Jupyter 노트북을 사용하는 경우 문서를 로드하기 전에 `nest_asyncio`를 적용해야 할 수 있습니다.

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

