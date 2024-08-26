---
sidebar_position: 1
title: जोड़ीदार एम्बेडिंग दूरी
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_embedding_distance.ipynb)

किसी साझा या समान इनपुट पर दो भविष्यवाणियों के बीच समानता (या असमानता) को मापने का एक तरीका है कि भविष्यवाणियों को एम्बेड करें और दो एम्बेडिंग के बीच एक वेक्टर दूरी की गणना करें।<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

आप इसे करने के लिए `pairwise_embedding_distance` मूल्यांकक लोड कर सकते हैं।

**नोट:** यह एक **दूरी** स्कोर लौटाता है, जिसका अर्थ है कि संख्या कम होने पर, उत्पादों की **अधिक** समानता होती है, उनके एम्बेडेड प्रतिनिधित्व के अनुसार।

[PairwiseEmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain) के लिए संदर्भ दस्तावेज़ देखें अधिक जानकारी के लिए।

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("pairwise_embedding_distance")
```

```python
evaluator.evaluate_string_pairs(
    prediction="Seattle is hot in June", prediction_b="Seattle is cool in June."
)
```

```output
{'score': 0.0966466944859925}
```

```python
evaluator.evaluate_string_pairs(
    prediction="Seattle is warm in June", prediction_b="Seattle is cool in June."
)
```

```output
{'score': 0.03761174337464557}
```

## दूरी मीट्रिक का चयन करें

डिफ़ॉल्ट रूप से, मूल्यांकक कोसाइन दूरी का उपयोग करता है। यदि आप चाहें तो आप एक अलग दूरी मीट्रिक का चयन कर सकते हैं।

```python
from langchain.evaluation import EmbeddingDistance

list(EmbeddingDistance)
```

```output
[<EmbeddingDistance.COSINE: 'cosine'>,
 <EmbeddingDistance.EUCLIDEAN: 'euclidean'>,
 <EmbeddingDistance.MANHATTAN: 'manhattan'>,
 <EmbeddingDistance.CHEBYSHEV: 'chebyshev'>,
 <EmbeddingDistance.HAMMING: 'hamming'>]
```

```python
evaluator = load_evaluator(
    "pairwise_embedding_distance", distance_metric=EmbeddingDistance.EUCLIDEAN
)
```

## उपयोग करने के लिए एम्बेडिंग का चयन करें

निर्माता `OpenAI` एम्बेडिंग का उपयोग करता है, लेकिन आप इसे जैसा भी चाहते हैं कॉन्फ़िगर कर सकते हैं। नीचे, huggingface स्थानीय एम्बेडिंग का उपयोग करें।

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings()
hf_evaluator = load_evaluator("pairwise_embedding_distance", embeddings=embedding_model)
```

```python
hf_evaluator.evaluate_string_pairs(
    prediction="Seattle is hot in June", prediction_b="Seattle is cool in June."
)
```

```output
{'score': 0.5486443280477362}
```

```python
hf_evaluator.evaluate_string_pairs(
    prediction="Seattle is warm in June", prediction_b="Seattle is cool in June."
)
```

```output
{'score': 0.21018880025138598}
```

<a name="cite_note-1"></a><i>1. नोट: सेमेंटिक समानता के मामले में, यह अक्सर पुराने स्ट्रिंग दूरी मीट्रिक्स (जैसे कि `PairwiseStringDistanceEvalChain` में) से बेहतर परिणाम देता है, हालांकि यह `PairwiseStringEvalChain` जैसे मूल्यांकक की तुलना में कम विश्वसनीय होता है जो LLM का सीधा उपयोग करते हैं।</i>
