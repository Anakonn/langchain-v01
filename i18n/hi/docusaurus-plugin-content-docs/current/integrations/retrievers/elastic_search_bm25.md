---
translated: true
---

# ElasticSearch BM25

>[Elasticsearch](https://www.elastic.co/elasticsearch/) एक वितरित, RESTful खोज और विश्लेषण इंजन है। यह एक वितरित, बहु-किराएदार-क्षमता वाला पूर्ण-पाठ खोज इंजन प्रदान करता है जिसमें एक HTTP वेब इंटरफ़ेस और स्कीमा-मुक्त JSON दस्तावेज़ होते हैं।

>सूचना पुनर्प्राप्ति में, [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25) (BM सर्वश्रेष्ठ मैचिंग का संक्षिप्त रूप है) एक रैंकिंग फ़ंक्शन है जिसका उपयोग खोज इंजन करते हैं ताकि दस्तावेजों की प्रासंगिकता का अनुमान लगाया जा सके। यह 1970 और 1980 के दशक में स्टीफन ई. रॉबर्टसन, कैरेन स्पार्क जोन्स और अन्य द्वारा विकसित प्रोबेबिलिस्टिक रिट्रीवल फ्रेमवर्क पर आधारित है।

>वास्तविक रैंकिंग फ़ंक्शन का नाम BM25 है। पूरा नाम, Okapi BM25, उस पहले सिस्टम का नाम शामिल करता है जिसने इसका उपयोग किया था, जो लंदन की सिटी यूनिवर्सिटी में 1980 और 1990 के दशक में लागू किया गया Okapi सूचना पुनर्प्राप्ति सिस्टम था। BM25 और इसके नए संस्करण, जैसे BM25F (जो दस्तावेज़ संरचना और एंकर पाठ को ध्यान में रखता है), दस्तावेज़ पुनर्प्राप्ति में उपयोग किए जाने वाले TF-IDF-जैसे पुनर्प्राप्ति फ़ंक्शन प्रतिनिधित्व करते हैं।

यह नोटबुक दिखाता है कि `ElasticSearch` और `BM25` का उपयोग करने वाला एक रिट्रीवर कैसे उपयोग किया जाए।

BM25 के विवरण के बारे में अधिक जानकारी के लिए [इस ब्लॉग पोस्ट](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables) देखें।

```python
%pip install --upgrade --quiet  elasticsearch
```

```python
from langchain_community.retrievers import (
    ElasticSearchBM25Retriever,
)
```

## नया रिट्रीवर बनाएं

```python
elasticsearch_url = "http://localhost:9200"
retriever = ElasticSearchBM25Retriever.create(elasticsearch_url, "langchain-index-4")
```

```python
# Alternatively, you can load an existing index
# import elasticsearch
# elasticsearch_url="http://localhost:9200"
# retriever = ElasticSearchBM25Retriever(elasticsearch.Elasticsearch(elasticsearch_url), "langchain-index")
```

## पाठ जोड़ें (यदि आवश्यक हो)

हम वैकल्पिक रूप से रिट्रीवर में पाठ जोड़ सकते हैं (यदि वे पहले से वहां नहीं हैं)

```python
retriever.add_texts(["foo", "bar", "world", "hello", "foo bar"])
```

```output
['cbd4cb47-8d9f-4f34-b80e-ea871bc49856',
 'f3bd2e24-76d1-4f9b-826b-ec4c0e8c7365',
 '8631bfc8-7c12-48ee-ab56-8ad5f373676e',
 '8be8374c-3253-4d87-928d-d73550a2ecf0',
 'd79f457b-2842-4eab-ae10-77aa420b53d7']
```

## रिट्रीवर का उपयोग करें

अब हम रिट्रीवर का उपयोग कर सकते हैं!

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={})]
```
