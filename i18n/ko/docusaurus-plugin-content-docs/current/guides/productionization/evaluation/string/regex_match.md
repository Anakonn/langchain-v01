---
translated: true
---

# 정규식 일치

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/regex_match.ipynb)

체인 또는 실행 가능한 문자열 예측을 사용자 정의 정규식과 비교하여 평가하려면 `regex_match` 평가기를 사용할 수 있습니다.

```python
from langchain.evaluation import RegexMatchStringEvaluator

evaluator = RegexMatchStringEvaluator()
```

또는 로더를 통해:

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("regex_match")
```

```python
# YYYY-MM-DD 문자열의 존재를 확인합니다.

evaluator.evaluate_strings(
    prediction="The delivery will be made on 2024-01-05",
    reference=".*\\b\\d{4}-\\d{2}-\\d{2}\\b.*",
)
```

```output
{'score': 1}
```

```python
# MM-DD-YYYY 문자열의 존재를 확인합니다.

evaluator.evaluate_strings(
    prediction="The delivery will be made on 2024-01-05",
    reference=".*\\b\\d{2}-\\d{2}-\\d{4}\\b.*",
)
```

```output
{'score': 0}
```

```python
# MM-DD-YYYY 문자열의 존재를 확인합니다.

evaluator.evaluate_strings(
    prediction="The delivery will be made on 01-05-2024",
    reference=".*\\b\\d{2}-\\d{2}-\\d{4}\\b.*",
)
```

```output
{'score': 1}
```

## 여러 패턴과의 일치

여러 패턴과 일치시키려면 정규식 유니언 "|"을 사용하십시오.

```python
# MM-DD-YYYY 문자열 또는 YYYY-MM-DD 문자열의 존재를 확인합니다.

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

## RegexMatchStringEvaluator 구성

일치시킬 때 사용할 정규식 플래그를 지정할 수 있습니다.

```python
import re

evaluator = RegexMatchStringEvaluator(flags=re.IGNORECASE)

# 또는

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