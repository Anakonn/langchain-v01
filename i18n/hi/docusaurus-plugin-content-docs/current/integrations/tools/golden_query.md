---
translated: true
---

# गोल्डन क्वेरी

>[Golden](https://golden.com) प्राकृतिक भाषा एपीआई का एक सेट प्रदान करता है जो गोल्डन नॉलेज ग्राफ का उपयोग करके क्वेरी और संवर्धन के लिए होता है, उदाहरण के लिए क्वेरी जैसे: `ओपनएआई के उत्पाद`, `सिरीज़ ए फंडिंग वाले जेनरेटिव एआई कंपनियाँ`, और `रैपर्स जो निवेश करते हैं` का उपयोग संबंधित संस्थाओं के बारे में संरचित डेटा प्राप्त करने के लिए किया जा सकता है।
>
>`गोल्डन-क्वेरी` लैंगचेन टूल [गोल्डन क्वेरी एपीआई](https://docs.golden.com/reference/query-api) के शीर्ष पर एक रैपर है जो इन परिणामों तक प्रोग्रामेटिक पहुंच को सक्षम करता है।
>अधिक जानकारी के लिए [गोल्डन क्वेरी एपीआई दस्तावेज़](https://docs.golden.com/reference/query-api) देखें।

यह नोटबुक `गोल्डन-क्वेरी` टूल का उपयोग कैसे करें, इसके बारे में बताती है।

- गोल्डन एपीआई के बारे में अवलोकन प्राप्त करने के लिए [गोल्डन एपीआई दस्तावेज़](https://docs.golden.com/) पर जाएं।
- [गोल्डन एपीआई सेटिंग्स](https://golden.com/settings/api) पेज से अपनी एपीआई कुंजी प्राप्त करें।
- अपनी एपीआई कुंजी को GOLDEN_API_KEY एनव वेरिएबल में सहेजें

```python
import os

os.environ["GOLDEN_API_KEY"] = ""
```

```python
from langchain_community.utilities.golden_query import GoldenQueryAPIWrapper
```

```python
golden_query = GoldenQueryAPIWrapper()
```

```python
import json

json.loads(golden_query.run("companies in nanotech"))
```

```output
{'results': [{'id': 4673886,
   'latestVersionId': 60276991,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Samsung', 'citations': []}]}]},
  {'id': 7008,
   'latestVersionId': 61087416,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Intel', 'citations': []}]}]},
  {'id': 24193,
   'latestVersionId': 60274482,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Texas Instruments', 'citations': []}]}]},
  {'id': 1142,
   'latestVersionId': 61406205,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Advanced Micro Devices', 'citations': []}]}]},
  {'id': 193948,
   'latestVersionId': 58326582,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Freescale Semiconductor', 'citations': []}]}]},
  {'id': 91316,
   'latestVersionId': 60387380,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Agilent Technologies', 'citations': []}]}]},
  {'id': 90014,
   'latestVersionId': 60388078,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Novartis', 'citations': []}]}]},
  {'id': 237458,
   'latestVersionId': 61406160,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Analog Devices', 'citations': []}]}]},
  {'id': 3941943,
   'latestVersionId': 60382250,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'AbbVie Inc.', 'citations': []}]}]},
  {'id': 4178762,
   'latestVersionId': 60542667,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'IBM', 'citations': []}]}]}],
 'next': 'https://golden.com/api/v2/public/queries/59044/results/?cursor=eyJwb3NpdGlvbiI6IFsxNzYxNiwgIklCTS04M1lQM1oiXX0%3D&pageSize=10',
 'previous': None}
```
