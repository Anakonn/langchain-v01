---
translated: true
---

# kNN

>सांख्यिकी में, [k-निकटतम पड़ोसी एल्गोरिथम (k-NN)](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) एक गैर-पैरामीटरीय पर्यवेक्षित सीखने की विधि है जिसे पहले `Evelyn Fix` और `Joseph Hodges` द्वारा 1951 में विकसित किया गया था, और बाद में `Thomas Cover` द्वारा विस्तारित किया गया था। इसका उपयोग वर्गीकरण और रिग्रेशन के लिए किया जाता है।

यह नोटबुक किसी रिट्रीवर का उपयोग करने के बारे में चर्चा करता है जो कि अंदर से एक kNN का उपयोग करता है।

[Andrej Karpathy](https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html) के कोड पर काफी हद तक आधारित।

```python
from langchain_community.retrievers import KNNRetriever
from langchain_openai import OpenAIEmbeddings
```

## नया रिट्रीवर बनाएं और पाठों को जोड़ें

```python
retriever = KNNRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
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
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='bar', metadata={})]
```
