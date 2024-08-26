---
translated: true
---

# 完全一致

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/exact_match.ipynb)

LLMまたは実行可能なストリング出力を参照ラベルに対して評価する最も単純な方法の1つは、単純な文字列等価性です。

これは `exact_match` 評価器を使用してアクセスできます。

```python
from langchain.evaluation import ExactMatchStringEvaluator

evaluator = ExactMatchStringEvaluator()
```

また、ローダーを介して:

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

## ExactMatchStringEvaluatorの設定

文字列の「正確さ」を緩和することができます。

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
