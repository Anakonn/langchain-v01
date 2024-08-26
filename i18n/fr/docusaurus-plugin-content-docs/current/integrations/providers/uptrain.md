---
translated: true
---

# UpTrain

>[UpTrain](https://uptrain.ai/) est une plateforme unifiée open-source pour évaluer et
>améliorer les applications d'IA génératrice. Elle fournit des notes pour plus de 20 évaluations préconfigurées
>(couvrant les cas d'utilisation du langage, du code, de l'intégration), effectue une analyse des causes profondes des cas d'échec
>et donne des informations sur la façon de les résoudre.

## Installation et configuration

```bash
pip install uptrain
```

## Callbacks

```python
<!--IMPORTS:[{"imported": "UpTrainCallbackHandler", "source": "langchain_community.callbacks.uptrain_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.uptrain_callback.UpTrainCallbackHandler.html", "title": "UpTrain"}]-->
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
```

Voir un [exemple](/docs/integrations/callbacks/uptrain).
