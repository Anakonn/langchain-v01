---
translated: true
---

# Fiddler

>[Fiddler](https://www.fiddler.ai/) fournit une plateforme unifiée pour surveiller, expliquer, analyser et améliorer les déploiements ML à l'échelle de l'entreprise.

## Installation et configuration

Configurez votre modèle [avec Fiddler](https://demo.fiddler.ai) :

* L'URL que vous utilisez pour vous connecter à Fiddler
* Votre ID d'organisation
* Votre jeton d'autorisation

Installez le package Python :

```bash
pip install fiddler-client
```

## Callbacks

```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

Voir un [exemple](/docs/integrations/callbacks/fiddler).
