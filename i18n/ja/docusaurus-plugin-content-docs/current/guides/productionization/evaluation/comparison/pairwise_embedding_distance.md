---
sidebar_position: 1
title: ペアワイズ埋め込み距離
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_embedding_distance.ipynb)

共有または類似した入力に対する2つの予測の類似性(または非類似性)を測る1つの方法は、予測をエンベディングし、2つのエンベディング間のベクトル距離を計算することです。<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

`pairwise_embedding_distance`評価器をロードしてこれを行うことができます。

**注意:** これは**距離**スコアを返します。つまり、数値が小さいほど、エンベディング表現によると、出力が**より**類似していることを意味します。

[PairwiseEmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain)のリファレンスドキュメントをチェックして、詳細を確認してください。

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

## 距離メトリックの選択

デフォルトでは、評価器はコサイン距離を使用します。必要に応じて、別の距離メトリックを選択することができます。

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

## 使用するエンベディングの選択

コンストラクターはデフォルトで`OpenAI`エンベディングを使用しますが、好きなように設定できます。以下では、Hugging Faceのローカルエンベディングを使用します。

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

<a name="cite_note-1"></a><i>1. 注意: 意味的な類似性については、これらの方が古い文字列距離メトリック(PairwiseStringDistanceEvalChainなどにあるもの)よりも良い結果を出すことが多いですが、LLMを直接使用する評価器(PairwiseStringEvalChainなど)ほど信頼性は高くありません。</i>
