---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/evaluation/comparison/pairwise_embedding_distance
sidebar_position: 1
title: Pairwise embedding distance
translated: false
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_embedding_distance.ipynb)

One way to measure the similarity (or dissimilarity) between two predictions on a shared or similar input is to embed the predictions and compute a vector distance between the two embeddings.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

You can load the `pairwise_embedding_distance` evaluator to do this.

**Note:** This returns a **distance** score, meaning that the lower the number, the **more** similar the outputs are, according to their embedded representation.

Check out the reference docs for the [PairwiseEmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain) for more info.

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

## Select the Distance Metric

By default, the evaluator uses cosine distance. You can choose a different distance metric if you'd like.

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

## Select Embeddings to Use

The constructor uses `OpenAI` embeddings by default, but you can configure this however you want. Below, use huggingface local embeddings

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

<a name="cite_note-1"></a><i>1. Note: When it comes to semantic similarity, this often gives better results than older string distance metrics (such as those in the `PairwiseStringDistanceEvalChain`), though it tends to be less reliable than evaluators that use the LLM directly (such as the `PairwiseStringEvalChain`) </i>