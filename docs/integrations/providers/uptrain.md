---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/uptrain
translated: false
---

# UpTrain

>[UpTrain](https://uptrain.ai/) is an open-source unified platform to evaluate and
>improve Generative AI applications. It provides grades for 20+ preconfigured evaluations
>(covering language, code, embedding use cases), performs root cause analysis on failure
>cases and gives insights on how to resolve them.

## Installation and Setup

```bash
pip install uptrain
```

## Callbacks

```python
<!--IMPORTS:[{"imported": "UpTrainCallbackHandler", "source": "langchain_community.callbacks.uptrain_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.uptrain_callback.UpTrainCallbackHandler.html", "title": "UpTrain"}]-->
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
```

See an [example](/docs/integrations/callbacks/uptrain).