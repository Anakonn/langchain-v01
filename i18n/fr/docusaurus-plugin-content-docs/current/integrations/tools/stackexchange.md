---
translated: true
---

# StackExchange

>[Stack Exchange](https://stackexchange.com/) est un réseau de sites de questions-réponses (Q&A) sur des sujets dans des domaines diversifiés, chaque site couvrant un sujet spécifique, où les questions, les réponses et les utilisateurs sont soumis à un processus d'attribution de réputation. Le système de réputation permet aux sites d'être auto-modérés.

Le composant ``StackExchange`` intègre l'API StackExchange dans LangChain, permettant l'accès au site [StackOverflow](https://stackoverflow.com/) du réseau Stack Exchange. Stack Overflow se concentre sur la programmation informatique.

Ce notebook explique comment utiliser le composant ``StackExchange``.

Nous devons d'abord installer le package python stackapi qui implémente l'API Stack Exchange.

```python
pip install --upgrade stackapi
```

```python
from langchain_community.utilities import StackExchangeAPIWrapper

stackexchange = StackExchangeAPIWrapper()

stackexchange.run("zsh: command not found: python")
```
