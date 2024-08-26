---
translated: true
---

# 정확히 일치

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/exact_match.ipynb)

LLM 또는 실행 가능한 문자열 출력을 참조 라벨과 비교하는 가장 간단한 방법 중 하나는 간단한 문자열 동등성을 사용하는 것입니다.

이는 `exact_match` 평가기를 사용하여 접근할 수 있습니다.

```python
from langchain.evaluation import ExactMatchStringEvaluator

evaluator = ExactMatchStringEvaluator()
```

또는 로더를 통해:

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

## ExactMatchStringEvaluator 구성

문자열을 비교할 때 "정확성"을 완화할 수 있습니다.

```python
evaluator = ExactMatchStringEvaluator(
    ignore_case=True,
    ignore_numbers=True,
    ignore_punctuation=True,
)

# 또는

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