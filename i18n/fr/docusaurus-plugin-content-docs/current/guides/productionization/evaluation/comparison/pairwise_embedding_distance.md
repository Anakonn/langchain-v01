---
sidebar_position: 1
title: Distance d'intégration par paires
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_embedding_distance.ipynb)

Une façon de mesurer la similarité (ou la dissimilarité) entre deux prédictions sur une entrée partagée ou similaire est d'intégrer les prédictions et de calculer une distance vectorielle entre les deux intégrations.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

Vous pouvez charger l'évaluateur `pairwise_embedding_distance` pour faire cela.

**Remarque :** Cela renvoie un score de **distance**, ce qui signifie que plus le nombre est faible, plus les sorties sont **similaires**, selon leur représentation intégrée.

Consultez la documentation de référence pour [PairwiseEmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain) pour plus d'informations.

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

## Sélectionnez la métrique de distance

Par défaut, l'évaluateur utilise la distance cosinus. Vous pouvez choisir une métrique de distance différente si vous le souhaitez.

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

## Sélectionnez les intégrations à utiliser

Le constructeur utilise les intégrations `OpenAI` par défaut, mais vous pouvez le configurer comme vous le souhaitez. Ci-dessous, utilisez les intégrations locales huggingface

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

<a name="cite_note-1"></a><i>1. Remarque : Lorsqu'il s'agit de similarité sémantique, cela donne souvent de meilleurs résultats que les anciennes métriques de distance de chaîne (comme celles de `PairwiseStringDistanceEvalChain`), bien qu'elles soient moins fiables que les évaluateurs qui utilisent directement le LLM (comme `PairwiseStringEvalChain`) </i>
