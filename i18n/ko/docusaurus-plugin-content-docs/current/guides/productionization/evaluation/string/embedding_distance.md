---
translated: true
---

# 임베딩 거리

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/embedding_distance.ipynb)

예측값과 참조 라벨 문자열 간의 의미적 유사성(또는 차이)을 측정하려면 `embedding_distance` 평가기를 사용하여 두 임베디드 표현 간의 벡터 거리 메트릭을 사용할 수 있습니다.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

**참고:** 이 평가기는 **거리** 점수를 반환하므로 숫자가 낮을수록 임베디드 표현에 따라 예측값이 참조값과 **더** 유사합니다.

[EmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain)의 참고 문서를 확인하세요.

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

## 거리 측정 기준 선택

기본적으로 평가기는 코사인 거리를 사용합니다. 원하는 경우 다른 거리 측정 기준을 선택할 수 있습니다.

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
# Enum 또는 원시 파이썬 문자열로 로드할 수 있습니다.

evaluator = load_evaluator(
    "embedding_distance", distance_metric=EmbeddingDistance.EUCLIDEAN
)
```

## 사용할 임베딩 선택

생성자는 기본적으로 `OpenAI` 임베딩을 사용하지만, 원하는 대로 구성할 수 있습니다. 아래에서는 HuggingFace 로컬 임베딩을 사용합니다.

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

<a name="cite_note-1"></a><i>1. 참고: 의미적 유사성 측면에서 이것은 종종 이전의 문자열 거리 메트릭(예: [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain))보다 더 나은 결과를 제공하지만, LLM을 직접 사용하는 평가기(예: [QAEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.qa.eval_chain.QAEvalChain.html#langchain.evaluation.qa.eval_chain) 또는 [LabeledCriteriaEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain.html#langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain))보다 신뢰성이 떨어지는 경향이 있습니다.</i>