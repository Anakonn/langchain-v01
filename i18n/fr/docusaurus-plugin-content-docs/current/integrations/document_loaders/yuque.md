---
translated: true
---

# Yuque

>[Yuque](https://www.yuque.com/) est une base de connaissances professionnelle basée sur le cloud pour la collaboration d'équipe dans la documentation.

Ce cahier couvre comment charger des documents à partir de `Yuque`.

Vous pouvez obtenir le jeton d'accès personnel en cliquant sur votre avatar personnel dans la page [Paramètres personnels](https://www.yuque.com/settings/tokens).

```python
from langchain_community.document_loaders import YuqueLoader
```

```python
loader = YuqueLoader(access_token="<your_personal_access_token>")
```

```python
docs = loader.load()
```
