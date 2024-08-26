---
translated: true
---

# TF-IDF

>[TF-IDF](https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting) का मतलब है शब्द-आवृत्ति गुणा उलट दस्तावेज़-आवृत्ति।

यह नोटबुक `scikit-learn` पैकेज का उपयोग करके [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) का उपयोग करने वाले रिट्रीवर का उपयोग करने के बारे में चर्चा करता है।

TF-IDF के विवरण के बारे में अधिक जानकारी के लिए [इस ब्लॉग पोस्ट](https://medium.com/data-science-bootcamp/tf-idf-basics-of-information-retrieval-48de122b2a4c) देखें।

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
from langchain_community.retrievers import TFIDFRetriever
```

## नए रिट्रीवर को पाठों के साथ बनाएं

```python
retriever = TFIDFRetriever.from_texts(["foo", "bar", "world", "hello", "foo bar"])
```

## दस्तावेजों के साथ नया रिट्रीवर बनाएं

अब आप बनाए गए दस्तावेजों के साथ एक नया रिट्रीवर बना सकते हैं।

```python
from langchain_core.documents import Document

retriever = TFIDFRetriever.from_documents(
    [
        Document(page_content="foo"),
        Document(page_content="bar"),
        Document(page_content="world"),
        Document(page_content="hello"),
        Document(page_content="foo bar"),
    ]
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
 Document(page_content='world', metadata={})]
```

## सहेजें और लोड करें

आप इस रिट्रीवर को आसानी से सहेज और लोड कर सकते हैं, जो स्थानीय विकास के लिए उपयोगी है!

```python
retriever.save_local("testing.pkl")
```

```python
retriever_copy = TFIDFRetriever.load_local("testing.pkl")
```

```python
retriever_copy.invoke("foo")
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='world', metadata={})]
```
