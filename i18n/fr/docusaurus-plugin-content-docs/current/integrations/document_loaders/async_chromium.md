---
translated: true
---

# Chromium asynchrone

Chromium est l'un des navigateurs pris en charge par Playwright, une bibliothèque utilisée pour contrôler l'automatisation des navigateurs.

En exécutant `p.chromium.launch(headless=True)`, nous lançons une instance en mode sans interface graphique de Chromium.

Le mode sans interface graphique signifie que le navigateur s'exécute sans interface graphique.

`AsyncChromiumLoader` charge la page, puis nous utilisons `Html2TextTransformer` pour la transformer en texte.

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

Si vous utilisez des notebooks Jupyter, vous devrez peut-être appliquer `nest_asyncio` avant de charger les documents.

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
