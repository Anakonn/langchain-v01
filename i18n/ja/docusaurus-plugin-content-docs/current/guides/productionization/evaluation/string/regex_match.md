---
translated: true
---

# Regex Match

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/regex_match.ipynb)

文字列予測をカスタムregexに対して評価するには、`regex_match`評価器を使用できます。

```python
from langchain.evaluation import RegexMatchStringEvaluator

evaluator = RegexMatchStringEvaluator()
```

また、ローダーを介して:

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

## 複数のパターンに対してマッチする

複数のパターンにマッチさせるには、regex unionの`|`を使用します。

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

## RegexMatchStringEvaluatorを設定する

マッチ時に使用するregexフラグを指定できます。

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
