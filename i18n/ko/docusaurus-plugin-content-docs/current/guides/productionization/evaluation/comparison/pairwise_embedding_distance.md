---
sidebar_position: 1
title: 페어와이즈 임베딩 거리
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_embedding_distance.ipynb)

공유 또는 유사한 입력에 대한 두 예측 간의 유사성(또는 차이)을 측정하는 한 가지 방법은 예측을 임베딩하고 두 임베딩 간의 벡터 거리를 계산하는 것입니다.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

이 작업을 수행하려면 `pairwise_embedding_distance` 평가기를 로드할 수 있습니다.

**참고:** 이 평가기는 **거리** 점수를 반환하므로 숫자가 낮을수록 임베딩된 표현에 따라 출력이 **더** 유사합니다.

[PairwiseEmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain)의 참고 문서를 확인하세요.

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
evaluator = load_evaluator(
    "pairwise_embedding_distance", distance_metric=EmbeddingDistance.EUCLIDEAN
)
```

## 사용할 임베딩 선택

생성자는 기본적으로 `OpenAI` 임베딩을 사용하지만, 원하는 대로 구성할 수 있습니다. 아래에서는 HuggingFace 로컬 임베딩을 사용합니다.

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

<a name="cite_note-1"></a><i>1. 참고: 의미적 유사성 측면에서 이것은 종종 이전의 문자열 거리 메트릭(예: `PairwiseStringDistanceEvalChain`에 있는 것)보다 더 나은 결과를 제공하지만, LLM을 직접 사용하는 평가기(예: `PairwiseStringEvalChain`)보다 신뢰성이 떨어지는 경향이 있습니다.</i>