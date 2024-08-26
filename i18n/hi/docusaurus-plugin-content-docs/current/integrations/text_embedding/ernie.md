---
translated: true
---

# ERNIE

[ERNIE Embedding-V1](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu) एक पाठ प्रतिनिधित्व मॉडल है जो `Baidu Wenxin` बड़े पैमाने पर मॉडल प्रौद्योगिकी पर आधारित है, जो पाठ को संख्यात्मक मूल्यों द्वारा प्रतिनिधित्व किए गए वेक्टर रूप में परिवर्तित करता है, और पाठ पुनर्प्राप्ति, सूचना अनुशंसा, ज्ञान खनन और अन्य परिदृश्यों में उपयोग किया जाता है।

**डिप्रीकेटेड चेतावनी**

हम उपयोगकर्ताओं को `langchain_community.embeddings.ErnieEmbeddings` का उपयोग करने की सलाह देते हैं
`langchain_community.embeddings.QianfanEmbeddingsEndpoint` का उपयोग करें।

`QianfanEmbeddingsEndpoint` के लिए प्रलेखन [यहाँ](/docs/integrations/text_embedding/baidu_qianfan_endpoint/) है।

वे 2 क्यों हम उपयोगकर्ताओं को `QianfanEmbeddingsEndpoint` का उपयोग करने की सलाह देते हैं:

1. `QianfanEmbeddingsEndpoint` क्वियानफान प्लेटफॉर्म में अधिक एम्बेडिंग मॉडल का समर्थन करता है।
2. `ErnieEmbeddings` का रखरखाव और डिप्रीकेशन की कमी है।

प्रवास के लिए कुछ सुझाव:

```python
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## उपयोग

```python
from langchain_community.embeddings import ErnieEmbeddings
```

```python
embeddings = ErnieEmbeddings()
```

```python
query_result = embeddings.embed_query("foo")
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
