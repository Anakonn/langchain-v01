---
translated: true
---

# रेगेक्स मैच

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/regex_match.ipynb)

कस्टम रेगेक्स के खिलाफ श्रृंखला या चलने वाली स्ट्रिंग भविष्यवाणियों का मूल्यांकन करने के लिए, आप `regex_match` मूल्यांकक का उपयोग कर सकते हैं।

```python
from langchain.evaluation import RegexMatchStringEvaluator

evaluator = RegexMatchStringEvaluator()
```

वैकल्पिक रूप से लोडर के माध्यम से:

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

## कई पैटर्न के खिलाफ मैच करें

कई पैटर्न के खिलाफ मैच करने के लिए, एक रेगेक्स संघ "|" का उपयोग करें।

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

## RegexMatchStringEvaluator कॉन्फ़िगर करें

आप मैच करते समय किसी भी रेगेक्स फ्लैग को निर्दिष्ट कर सकते हैं।

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
