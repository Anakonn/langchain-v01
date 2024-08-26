---
translated: true
---

# Feux d'artifice

Cette page couvre comment utiliser les modèles [Fireworks](https://fireworks.ai/) dans Langchain.

## Installation et configuration

- Installez le package d'intégration Fireworks.

  ```
  pip install langchain-fireworks
  ```

- Obtenez une clé API Fireworks en vous inscrivant sur [fireworks.ai](https://fireworks.ai).
- Authentifiez-vous en définissant la variable d'environnement FIREWORKS_API_KEY.

## Authentification

Il existe deux façons de s'authentifier à l'aide de votre clé API Fireworks :

1.  Définir la variable d'environnement `FIREWORKS_API_KEY`.

    ```python
    os.environ["FIREWORKS_API_KEY"] = "<KEY>"
    ```

2.  Définir le champ `api_key` dans le module LLM Fireworks.

    ```python
    llm = Fireworks(api_key="<KEY>")
    ```

## Utilisation du module LLM Fireworks

Fireworks s'intègre à Langchain via le module LLM. Dans cet exemple, nous
utiliserons le modèle mixtral-8x7b-instruct.

```python
<!--IMPORTS:[{"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_fireworks import Fireworks

llm = Fireworks(
    api_key="<KEY>",
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    max_tokens=256)
llm("Name 3 sports.")
```

Pour un didacticiel plus détaillé, voir [ici](/docs/integrations/llms/Fireworks).
