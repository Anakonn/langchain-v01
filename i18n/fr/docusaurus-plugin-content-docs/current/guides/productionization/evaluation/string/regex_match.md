---
translated: true
---

# Correspondance Regex

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/regex_match.ipynb)

Pour évaluer les prédictions de chaîne ou exécutables par rapport à une regex personnalisée, vous pouvez utiliser l'évaluateur `regex_match`.

```python
from langchain.evaluation import RegexMatchStringEvaluator

evaluator = RegexMatchStringEvaluator()
```

Alternativement via le chargeur :

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("regex_match")
```

```python
# Check for the presence of a YYYY-MM-DD string.
evaluator.evaluate_strings(
    prediction="The delivery will be made on 2024-01-05",
    reference=".*\\b\\d{4}-\\d{2}-\\d{2}\\b.*",
)
```

```output
{'score': 1}
```

```python
# Check for the presence of a MM-DD-YYYY string.
evaluator.evaluate_strings(
    prediction="The delivery will be made on 2024-01-05",
    reference=".*\\b\\d{2}-\\d{2}-\\d{4}\\b.*",
)
```

```output
{'score': 0}
```

```python
# Check for the presence of a MM-DD-YYYY string.
evaluator.evaluate_strings(
    prediction="The delivery will be made on 01-05-2024",
    reference=".*\\b\\d{2}-\\d{2}-\\d{4}\\b.*",
)
```

```output
{'score': 1}
```

## Correspondance avec plusieurs motifs

Pour correspondre à plusieurs motifs, utilisez une union regex `|`.

```python
# Check for the presence of a MM-DD-YYYY string or YYYY-MM-DD
evaluator.evaluate_strings(
    prediction="The delivery will be made on 01-05-2024",
    reference="|".join(
        [".*\\b\\d{4}-\\d{2}-\\d{2}\\b.*", ".*\\b\\d{2}-\\d{2}-\\d{4}\\b.*"]
    ),
)
```

```output
{'score': 1}
```

## Configurer le RegexMatchStringEvaluator

Vous pouvez spécifier les drapeaux regex à utiliser lors de la correspondance.

```python
import re

evaluator = RegexMatchStringEvaluator(flags=re.IGNORECASE)

# Alternatively
# evaluator = load_evaluator("exact_match", flags=re.IGNORECASE)
```

```python
evaluator.evaluate_strings(
    prediction="I LOVE testing",
    reference="I love testing",
)
```

```output
{'score': 1}
```
