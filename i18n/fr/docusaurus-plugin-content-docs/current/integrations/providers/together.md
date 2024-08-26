---
translated: true
---

# Together AI

[Together AI](https://www.together.ai/) offre une API pour interroger [plus de 50 modèles open-source leaders](https://docs.together.ai/docs/inference-models) en quelques lignes de code.

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles Together AI.

## Installation

```python
%pip install --upgrade langchain-together
```

## Environnement

Pour utiliser Together AI, vous aurez besoin d'une clé API que vous pouvez trouver ici :
https://api.together.ai/settings/api-keys. Celle-ci peut être transmise en tant que paramètre d'initialisation
``together_api_key`` ou définie en tant que variable d'environnement ``TOGETHER_API_KEY``.

## Exemple

```python
# Querying chat models with Together AI

from langchain_together import ChatTogether

# choose from our 50+ models here: https://docs.together.ai/docs/inference-models
chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# stream the response back from the model
for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# if you don't want to do streaming, you can use the invoke method
# chat.invoke("Tell me fun things to do in NYC")
```

```python
# Querying code and language models with Together AI

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```
