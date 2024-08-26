---
translated: true
---

# एम्बेडिंग दूरी

[![कोलब में खोलें](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/embedding_distance.ipynb)

किसी भविष्यवाणी और एक संदर्भ लेबल स्ट्रिंग के बीच语义समानता (या असमानता) को मापने के लिए, आप `embedding_distance` मूल्यांकक का उपयोग करके दोनों एम्बेडेड प्रतिनिधित्वों के बीच एक वेक्टर दूरी मीट्रिक का उपयोग कर सकते हैं।<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

**नोट:** यह एक **दूरी** स्कोर वापस देता है, जिसका अर्थ है कि संख्या कम होने पर, भविष्यवाणी और संदर्भ के अनुसार उनके एम्बेडेड प्रतिनिधित्व के अनुसार **अधिक** समान होती है।

[EmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain) के लिए संदर्भ दस्तावेज़ देखें।

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("embedding_distance")
```

```python
evaluator.evaluate_strings(prediction="I shall go", reference="I shan't go")
```

```output
{'score': 0.0966466944859925}
```

```python
evaluator.evaluate_strings(prediction="I shall go", reference="I will go")
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
# You can load by enum or by raw python string
evaluator = load_evaluator(
    "embedding_distance", distance_metric=EmbeddingDistance.EUCLIDEAN
)
```

## उपयोग करने के लिए एम्बेडिंग का चयन करें

निर्माता `OpenAI` एम्बेडिंग का उपयोग करता है, लेकिन आप इसे जैसा चाहें कॉन्फ़िगर कर सकते हैं। नीचे, स्थानीय huggingface एम्बेडिंग का उपयोग करें।

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings()
hf_evaluator = load_evaluator("embedding_distance", embeddings=embedding_model)
```

```python
hf_evaluator.evaluate_strings(prediction="I shall go", reference="I shan't go")
```

```output
{'score': 0.5486443280477362}
```

```python
hf_evaluator.evaluate_strings(prediction="I shall go", reference="I will go")
```

```output
{'score': 0.21018880025138598}
```

<a name="cite_note-1"></a><i>1. नोट: जब भी भाषिक समानता की बात आती है, यह अक्सर पुराने स्ट्रिंग दूरी मीट्रिक (जैसे कि [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain)) में) से बेहतर परिणाम देता है, हालांकि यह LLM को सीधे उपयोग करने वाले मूल्यांकक (जैसे [QAEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.qa.eval_chain.QAEvalChain.html#langchain.evaluation.qa.eval_chain.QAEvalChain) या [LabeledCriteriaEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain.html#langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain))) की तुलना में कम विश्वसनीय होता है।</i>
