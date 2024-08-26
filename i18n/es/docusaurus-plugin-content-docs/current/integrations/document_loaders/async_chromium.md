---
translated: true
---

# Chromium asíncrono

Chromium es uno de los navegadores compatibles con Playwright, una biblioteca utilizada para controlar la automatización del navegador.

Al ejecutar `p.chromium.launch(headless=True)`, estamos iniciando una instancia sin cabeza de Chromium.

El modo sin cabeza significa que el navegador se está ejecutando sin una interfaz gráfica de usuario.

`AsyncChromiumLoader` carga la página y luego usamos `Html2TextTransformer` para transformarla a texto.

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

Si está utilizando cuadernos de Jupyter, es posible que deba aplicar `nest_asyncio` antes de cargar los documentos.

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
