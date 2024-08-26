---
translated: true
---

# Intégration de la distance

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/embedding_distance.ipynb)

Pour mesurer la similarité (ou la dissimilarité) sémantique entre une prédiction et une chaîne d'étiquette de référence, vous pourriez utiliser une métrique de distance vectorielle les deux représentations intégrées à l'aide de l'évaluateur `embedding_distance`.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

**Remarque :** Cela renvoie un score de **distance**, ce qui signifie que plus le nombre est faible, plus la prédiction est **similaire** à la référence, selon leur représentation intégrée.

Consultez la documentation de référence pour [EmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain) pour plus d'informations.

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
# You can load by enum or by raw python string
evaluator = load_evaluator(
    "embedding_distance", distance_metric=EmbeddingDistance.EUCLIDEAN
)
```

## Sélectionnez les intégrations à utiliser

Le constructeur utilise les intégrations `OpenAI` par défaut, mais vous pouvez configurer cela comme vous le souhaitez. Ci-dessous, utilisez les intégrations locales huggingface

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

<a name="cite_note-1"></a><i>1. Remarque : Lorsqu'il s'agit de similarité sémantique, cela donne souvent de meilleurs résultats que les anciennes métriques de distance de chaîne (comme celles de la [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain)), bien qu'elle soit moins fiable que les évaluateurs qui utilisent directement le LLM (comme la [QAEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.qa.eval_chain.QAEvalChain.html#langchain.evaluation.qa.eval_chain.QAEvalChain) ou la [LabeledCriteriaEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain.html#langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain)) </i>
