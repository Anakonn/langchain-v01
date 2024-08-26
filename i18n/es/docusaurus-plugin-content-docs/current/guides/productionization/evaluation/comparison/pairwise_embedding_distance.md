---
sidebar_position: 1
title: Distancia de incrustación por pares
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_embedding_distance.ipynb)

Una forma de medir la similitud (o disimilitud) entre dos predicciones en una entrada compartida o similar es incrustar las predicciones y calcular una distancia vectorial entre las dos incrustaciones.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

Puedes cargar el evaluador `pairwise_embedding_distance` para hacer esto.

**Nota:** Esto devuelve una puntuación de **distancia**, lo que significa que cuanto menor sea el número, más **similares** serán los resultados, según su representación incrustada.

Consulta la documentación de referencia para [PairwiseEmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.PairwiseEmbeddingDistanceEvalChain) para obtener más información.

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

## Seleccionar la métrica de distancia

De forma predeterminada, el evaluador utiliza la distancia coseno. Puedes elegir una métrica de distancia diferente si lo deseas.

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

## Seleccionar las incrustaciones a utilizar

El constructor utiliza las incrustaciones de `OpenAI` de forma predeterminada, pero puedes configurarlo como quieras. A continuación, utiliza las incrustaciones locales de huggingface

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

<a name="cite_note-1"></a><i>1. Nota: Cuando se trata de similitud semántica, a menudo da mejores resultados que las métricas de distancia de cadena más antiguas (como las de `PairwiseStringDistanceEvalChain`), aunque suele ser menos confiable que los evaluadores que utilizan el LLM directamente (como `PairwiseStringEvalChain`) </i>
