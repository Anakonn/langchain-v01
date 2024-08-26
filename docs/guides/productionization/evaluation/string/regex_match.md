---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/evaluation/string/regex_match
translated: false
---

# Regex Match

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/regex_match.ipynb)

To evaluate chain or runnable string predictions against a custom regex, you can use the `regex_match` evaluator.

```python
from langchain.evaluation import RegexMatchStringEvaluator

evaluator = RegexMatchStringEvaluator()
```

Alternatively via the loader:

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

## Match against multiple patterns

To match against multiple patterns, use a regex union "|".

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

## Configure the RegexMatchStringEvaluator

You can specify any regex flags to use when matching.

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