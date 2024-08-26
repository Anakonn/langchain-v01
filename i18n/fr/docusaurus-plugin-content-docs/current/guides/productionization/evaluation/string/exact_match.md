---
translated: true
---

# Correspondance exacte

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/exact_match.ipynb)

L'un des moyens les plus simples d'évaluer la sortie de chaîne d'un LLM ou d'un exécutable par rapport à une étiquette de référence est l'équivalence de chaîne simple.

Cela peut être accédé en utilisant l'évaluateur `exact_match`.

```python
from langchain.evaluation import ExactMatchStringEvaluator

evaluator = ExactMatchStringEvaluator()
```

Alternativement via le chargeur :

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

## Configurer l'ExactMatchStringEvaluator

Vous pouvez assouplir l'"exactitude" lors de la comparaison des chaînes.

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
