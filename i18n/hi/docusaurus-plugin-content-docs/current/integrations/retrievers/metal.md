---
translated: true
---

# धातु

>[धातु](https://github.com/getmetal/metal-python) एमएल एम्बेडिंग के लिए एक प्रबंधित सेवा है।

यह नोटबुक [धातु](https://docs.getmetal.io/introduction) के पुनर्प्राप्तकर्ता का उपयोग करने का प्रदर्शन करता है।

पहले, आपको धातु के लिए साइन अप करना और एक API कुंजी प्राप्त करनी होगी। आप ऐसा [यहाँ](https://docs.getmetal.io/misc-create-app) कर सकते हैं।

```python
%pip install --upgrade --quiet  metal_sdk
```

```python
from metal_sdk.metal import Metal

API_KEY = ""
CLIENT_ID = ""
INDEX_ID = ""

metal = Metal(API_KEY, CLIENT_ID, INDEX_ID)
```

## दस्तावेज़ इंजेस्ट करें

आप केवल तभी ऐसा करें जब आपने पहले से कोई सूचकांक सेट नहीं किया है।

```python
metal.index({"text": "foo1"})
metal.index({"text": "foo"})
```

```output
{'data': {'id': '642739aa7559b026b4430e42',
  'text': 'foo',
  'createdAt': '2023-03-31T19:51:06.748Z'}}
```

## प्रश्न

अब जब हमारा सूचकांक सेट है, तो हम एक पुनर्प्राप्तकर्ता सेट कर सकते हैं और इसे क्वेरी करना शुरू कर सकते हैं।

```python
from langchain_community.retrievers import MetalRetriever
```

```python
retriever = MetalRetriever(metal, params={"limit": 2})
```

```python
retriever.invoke("foo1")
```

```output
[Document(page_content='foo1', metadata={'dist': '1.19209289551e-07', 'id': '642739a17559b026b4430e40', 'createdAt': '2023-03-31T19:50:57.853Z'}),
 Document(page_content='foo1', metadata={'dist': '4.05311584473e-06', 'id': '642738f67559b026b4430e3c', 'createdAt': '2023-03-31T19:48:06.769Z'})]
```
