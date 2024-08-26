---
translated: true
---

# TensorFlow Hub

>[TensorFlow Hub](https://www.tensorflow.org/hub)는 미세 조정 및 어디서나 배포할 수 있는 사전 학습된 기계 학습 모델 저장소입니다. `BERT` 및 `Faster R-CNN`과 같은 사전 학습된 모델을 몇 줄의 코드로 재사용할 수 있습니다.
>
>
TensorflowHub Embedding 클래스를 로드해 보겠습니다.

```python
from langchain_community.embeddings import TensorflowHubEmbeddings
```

```python
embeddings = TensorflowHubEmbeddings()
```

```output
2023-01-30 23:53:01.652176: I tensorflow/core/platform/cpu_feature_guard.cc:193] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX2 FMA
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
2023-01-30 23:53:34.362802: I tensorflow/core/platform/cpu_feature_guard.cc:193] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX2 FMA
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_results = embeddings.embed_documents(["foo"])
```

```python
doc_results
```
