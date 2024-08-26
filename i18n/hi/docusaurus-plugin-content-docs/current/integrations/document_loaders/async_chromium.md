---
translated: true
---

# असिंक्रोनस क्रोमियम

क्रोमियम प्लेराइटर द्वारा समर्थित ब्राउज़रों में से एक है, जो ब्राउज़र ऑटोमेशन को नियंत्रित करने के लिए एक लाइब्रेरी है।

`p.chromium.launch(headless=True)` चलाकर, हम क्रोमियम का एक निर्देशात्मक इंस्टेंस लॉन्च कर रहे हैं।

निर्देशात्मक मोड का मतलब है कि ब्राउज़र एक ग्राफिकल उपयोगकर्ता इंटरफ़ेस के बिना चल रहा है।

`AsyncChromiumLoader` पृष्ठ लोड करता है, और फिर हम `Html2TextTransformer` का उपयोग करते हैं ताकि इसे पाठ में रूपांतरित किया जा सके।

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

यदि आप जूपीटर नोटबुक का उपयोग कर रहे हैं, तो आपको दस्तावेज़ लोड करने से पहले `nest_asyncio` लागू करने की आवश्यकता हो सकती है।

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
