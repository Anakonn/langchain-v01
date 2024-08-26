---
translated: true
---

# एसवीएम

>[समर्थन वेक्टर मशीन (एसवीएम)](https://scikit-learn.org/stable/modules/svm.html#support-vector-machines) वर्गीकरण, रिग्रेशन और आउटलाइर्स का पता लगाने के लिए उपयोग किए जाने वाले पर्यवेक्षित सीखने की विधियों का एक सेट हैं।

यह नोटबुक `scikit-learn` पैकेज का उपयोग करके एक `एसवीएम` का उपयोग करने वाले एक रिट्रीवर का उपयोग करने के बारे में चर्चा करता है।

लार्जली https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html पर आधारित

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
%pip install --upgrade --quiet  lark
```

हमें `OpenAIEmbeddings` का उपयोग करना है, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.retrievers import SVMRetriever
from langchain_openai import OpenAIEmbeddings
```

## नए रिट्रीवर को पाठों के साथ बनाएं

```python
retriever = SVMRetriever.from_texts(
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
 Document(page_content='world', metadata={})]
```
