---
translated: true
---

# API KoboldAI

[KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) est "une interface web pour l'écriture assistée par l'IA avec plusieurs modèles d'IA locaux et distants...". Il dispose d'une API publique et locale qui peut être utilisée dans langchain.

Cet exemple explique comment utiliser LangChain avec cette API.

La documentation peut être consultée dans le navigateur en ajoutant /api à la fin de votre point de terminaison (c'est-à-dire http://127.0.0.1/:5000/api).

```python
from langchain_community.llms import KoboldApiLLM
```

Remplacez le point de terminaison vu ci-dessous par celui affiché dans la sortie après avoir démarré le webui avec --api ou --public-api

Vous pouvez éventuellement passer des paramètres comme temperature ou max_length

```python
llm = KoboldApiLLM(endpoint="http://192.168.1.144:5000", max_length=80)
```

```python
response = llm.invoke(
    "### Instruction:\nWhat is the first book of the bible?\n### Response:"
)
```
