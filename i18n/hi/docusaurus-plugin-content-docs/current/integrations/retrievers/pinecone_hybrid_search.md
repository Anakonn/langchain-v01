---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# पाइनकोन हाइब्रिड खोज

>[पाइनकोन](https://docs.pinecone.io/docs/overview) एक व्यापक कार्यक्षमता वाला वेक्टर डेटाबेस है।

यह नोटबुक पाइनकोन और हाइब्रिड खोज का उपयोग करने वाले रिट्रीवर के बारे में बताता है।

इस रिट्रीवर की तर्क [इस दस्तावेज़](https://docs.pinecone.io/docs/hybrid-search) से ली गई है।

पाइनकोन का उपयोग करने के लिए, आपके पास एक API कुंजी और एक वातावरण होना चाहिए।
यहां [स्थापना निर्देश](https://docs.pinecone.io/docs/quickstart) हैं।

```python
%pip install --upgrade --quiet  pinecone-client pinecone-text
```

```python
import getpass
import os

os.environ["PINECONE_API_KEY"] = getpass.getpass("Pinecone API Key:")
```

```python
from langchain_community.retrievers import (
    PineconeHybridSearchRetriever,
)
```

```python
os.environ["PINECONE_ENVIRONMENT"] = getpass.getpass("Pinecone Environment:")
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## पाइनकोन सेटअप करें

आपको केवल एक बार यह भाग करना होगा।

नोट: यह महत्वपूर्ण है कि मेटाडेटा में दस्तावेज़ पाठ को धारण करने वाला "संदर्भ" फ़ील्ड अनुक्रमित नहीं किया जाता है। वर्तमान में आपको स्पष्ट रूप से वे फ़ील्ड निर्दिष्ट करने की आवश्यकता है जिन्हें आप अनुक्रमित करना चाहते हैं। अधिक जानकारी के लिए पाइनकोन के [दस्तावेज़](https://docs.pinecone.io/docs/manage-indexes#selective-metadata-indexing) देखें।

```python
import os

import pinecone

api_key = os.getenv("PINECONE_API_KEY") or "PINECONE_API_KEY"

index_name = "langchain-pinecone-hybrid-search"
```

```output
WhoAmIResponse(username='load', user_label='label', projectname='load-test')
```

```python
# create the index
pinecone.create_index(
    name=index_name,
    dimension=1536,  # dimensionality of dense model
    metric="dotproduct",  # sparse values supported only for dotproduct
    pod_type="s1",
    metadata_config={"indexed": []},  # see explanation above
)
```

अब जब यह बना दिया गया है, तो हम इसका उपयोग कर सकते हैं।

```python
index = pinecone.Index(index_name)
```

## एम्बेडिंग और स्पार्स एनकोडर प्राप्त करें

एम्बेडिंग घने वेक्टरों के लिए उपयोग किए जाते हैं, टोकनाइज़र स्पार्स वेक्टर के लिए उपयोग किया जाता है।

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

पाठ को स्पार्स मान में एनकोड करने के लिए आप या तो SPLADE या BM25 का चयन कर सकते हैं। आउट ऑफ डोमेन कार्यों के लिए हम BM25 का उपयोग करने की सिफारिश करते हैं।

स्पार्स एनकोडर के बारे में अधिक जानकारी के लिए आप पाइनकोन-पाठ लाइब्रेरी [दस्तावेज़](https://pinecone-io.github.io/pinecone-text/pinecone_text.html) देख सकते हैं।

```python
from pinecone_text.sparse import BM25Encoder

# or from pinecone_text.sparse import SpladeEncoder if you wish to work with SPLADE

# use default tf-idf values
bm25_encoder = BM25Encoder().default()
```

उपरोक्त कोड डिफ़ॉल्ट tfids मान का उपयोग कर रहा है। अपने स्वयं के कॉर्पस के लिए tf-idf मान को फिट करना बहुत अधिक अनुशंसित है। आप इसे निम्नानुसार कर सकते हैं:

```python
corpus = ["foo", "bar", "world", "hello"]

# fit tf-idf values on your corpus
bm25_encoder.fit(corpus)

# store the values to a json file
bm25_encoder.dump("bm25_values.json")

# load to your BM25Encoder object
bm25_encoder = BM25Encoder().load("bm25_values.json")
```

## रिट्रीवर लोड करें

अब हम रिट्रीवर का निर्माण कर सकते हैं!

```python
retriever = PineconeHybridSearchRetriever(
    embeddings=embeddings, sparse_encoder=bm25_encoder, index=index
)
```

## पाठ जोड़ें (यदि आवश्यक हो)

हम वैकल्पिक रूप से रिट्रीवर में पाठ जोड़ सकते हैं (यदि वे पहले से ही वहां नहीं हैं)।

```python
retriever.add_texts(["foo", "bar", "world", "hello"])
```

```output
100%|██████████| 1/1 [00:02<00:00,  2.27s/it]
```

## रिट्रीवर का उपयोग करें

अब हम रिट्रीवर का उपयोग कर सकते हैं!

```python
result = retriever.invoke("foo")
```

```python
result[0]
```

```output
Document(page_content='foo', metadata={})
```
