---
translated: true
---

# 埋め込み距離

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/embedding_distance.ipynb)

予測と参照ラベル文字列の意味的類似性（または非類似性）を測るには、`embedding_distance`評価器を使って2つの埋め込み表現のベクトル距離メトリックを使うことができます。<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

**注意:** これは**距離**スコアを返します。つまり、数値が小さいほど、予測と参照の埋め込み表現が**より**類似していることを示します。

[EmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain)のリファレンスドキュメントをチェックしてください。

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
# You can load by enum or by raw python string
evaluator = load_evaluator(
    "embedding_distance", distance_metric=EmbeddingDistance.EUCLIDEAN
)
```

## 使用する埋め込みの選択

コンストラクターはデフォルトで`OpenAI`の埋め込みを使用しますが、好きなように設定できます。以下では、Hugging Faceのローカル埋め込みを使用します。

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

<a name="cite_note-1"></a><i>1. 意味的類似性については、これらの結果は古い文字列距離メトリック（[StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain))など）よりも良い場合が多いですが、LLMを直接使う評価器（[QAEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.qa.eval_chain.QAEvalChain.html#langchain.evaluation.qa.eval_chain.QAEvalChain)や[LabeledCriteriaEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain.html#langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain))など）ほど信頼性は高くありません。</i>
