---
translated: true
---

# Incrustación de distancia

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/embedding_distance.ipynb)

Para medir la similitud (o disimilitud) semántica entre una predicción y una cadena de etiqueta de referencia, puede usar una métrica de distancia vectorial las dos representaciones incrustadas utilizando el evaluador `embedding_distance`.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)

**Nota:** Esto devuelve un puntaje de **distancia**, lo que significa que cuanto menor sea el número, más **similar** será la predicción a la referencia, según su representación incrustada.

Consulte la documentación de referencia para [EmbeddingDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain.html#langchain.evaluation.embedding_distance.base.EmbeddingDistanceEvalChain) para obtener más información.

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

## Seleccionar la métrica de distancia

De forma predeterminada, el evaluador usa la distancia coseno. Puede elegir una métrica de distancia diferente si lo desea.

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

## Seleccionar incrustaciones a usar

El constructor usa incrustaciones de `OpenAI` de forma predeterminada, pero puede configurarlo como desee. A continuación, use incrustaciones locales de huggingface

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

<a name="cite_note-1"></a><i>1. Nota: Cuando se trata de similitud semántica, a menudo da mejores resultados que las métricas de distancia de cadenas más antiguas (como las de [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain)), aunque tiende a ser menos confiable que los evaluadores que usan el LLM directamente (como [QAEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.qa.eval_chain.QAEvalChain.html#langchain.evaluation.qa.eval_chain.QAEvalChain) o [LabeledCriteriaEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain.html#langchain.evaluation.criteria.eval_chain.LabeledCriteriaEvalChain)) </i>
