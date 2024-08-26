---
translated: true
---

# सटीक मेल

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/exact_match.ipynb)

किसी एलएलएम या रनेबल के स्ट्रिंग आउटपुट को संदर्भ लेबल के खिलाफ मूल्यांकन करने का सबसे सरल तरीका एक सरल स्ट्रिंग समकक्षता है।

इसका उपयोग `exact_match` मूल्यांकक का उपयोग करके किया जा सकता है।

```python
from langchain.evaluation import ExactMatchStringEvaluator

evaluator = ExactMatchStringEvaluator()
```

वैकल्पिक रूप से लोडर के माध्यम से:

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

## ExactMatchStringEvaluator कॉन्फ़िगर करें

आप स्ट्रिंग की तुलना करते समय "सटीकता" को ढीला कर सकते हैं।

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
