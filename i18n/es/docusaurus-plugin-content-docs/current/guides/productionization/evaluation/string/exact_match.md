---
translated: true
---

# Coincidencia exacta

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/exact_match.ipynb)

Probablemente las formas más simples de evaluar la salida de cadena de un LLM o ejecutable contra una etiqueta de referencia es mediante una simple equivalencia de cadenas.

Esto se puede acceder usando el evaluador `exact_match`.

```python
from langchain.evaluation import ExactMatchStringEvaluator

evaluator = ExactMatchStringEvaluator()
```

Alternativamente a través del cargador:

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("exact_match")
```

```python
evaluator.evaluate_strings(
    prediction="1 LLM.",
    reference="2 llm",
)
```

```output
{'score': 0}
```

```python
evaluator.evaluate_strings(
    prediction="LangChain",
    reference="langchain",
)
```

```output
{'score': 0}
```

## Configurar el ExactMatchStringEvaluator

Puede relajar la "exactitud" al comparar cadenas.

```python
evaluator = ExactMatchStringEvaluator(
    ignore_case=True,
    ignore_numbers=True,
    ignore_punctuation=True,
)

# Alternatively
# evaluator = load_evaluator("exact_match", ignore_case=True, ignore_numbers=True, ignore_punctuation=True)
```

```python
evaluator.evaluate_strings(
    prediction="1 LLM.",
    reference="2 llm",
)
```

```output
{'score': 1}
```
