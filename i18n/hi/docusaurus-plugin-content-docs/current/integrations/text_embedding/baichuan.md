---
translated: true
---

# बैचुआन टेक्स्ट एम्बेडिंग्स

आज (25 जनवरी, 2024) तक बैचुआन टेक्स्ट एम्बेडिंग्स सी-एमटीईबी (चाइनीज़ मल्टी-टास्क एम्बेडिंग बेंचमार्क) लीडरबोर्ड में नंबर 1 पर है।

लीडरबोर्ड (ओवरऑल -> चाइनीज़ सेक्शन में): https://huggingface.co/spaces/mteb/leaderboard

आधिकारिक वेबसाइट: https://platform.baichuan-ai.com/docs/text-Embedding

इस एम्बेडिंग मॉडल का उपयोग करने के लिए एक API कुंजी की आवश्यकता है। आप https://platform.baichuan-ai.com/docs/text-Embedding पर पंजीकरण करके एक प्राप्त कर सकते हैं।

BaichuanTextEmbeddings 512 टोकन विंडो का समर्थन करता है और 1024 आयामों के वेक्टर उत्पन्न करता है।

कृपया ध्यान दें कि BaichuanTextEmbeddings केवल चीनी पाठ एम्बेडिंग का समर्थन करता है। बहुभाषीय समर्थन जल्द ही आ रहा है।

```python
from langchain_community.embeddings import BaichuanTextEmbeddings

embeddings = BaichuanTextEmbeddings(baichuan_api_key="sk-*")
```

वैकल्पिक रूप से, आप इस तरह से API कुंजी सेट कर सकते हैं:

```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```

```python
text_1 = "今天天气不错"
text_2 = "今天阳光很好"

query_result = embeddings.embed_query(text_1)
query_result
```

```python
doc_result = embeddings.embed_documents([text_1, text_2])
doc_result
```
