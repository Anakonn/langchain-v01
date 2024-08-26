---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/fiddler
translated: false
---

# Fiddler

>[Fiddler](https://www.fiddler.ai/) provides a unified platform to monitor, explain, analyze,
> and improve ML deployments at an enterprise scale.

## Installation and Setup

Set up your model [with Fiddler](https://demo.fiddler.ai):

* The URL you're using to connect to Fiddler
* Your organization ID
* Your authorization token

Install the Python package:

```bash
pip install fiddler-client
```

## Callbacks

```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

See an [example](/docs/integrations/callbacks/fiddler).