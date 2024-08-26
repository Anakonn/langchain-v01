---
translated: true
---

# Copier-coller

Ce cahier couvre comment charger un objet de document à partir de quelque chose que vous voulez juste copier et coller. Dans ce cas, vous n'avez même pas besoin d'utiliser un DocumentLoader, mais vous pouvez plutôt construire le Document directement.

```python
from langchain_community.docstore.document import Document
```

```python
text = "..... put the text you copy pasted here......"
```

```python
doc = Document(page_content=text)
```

## Métadonnées

Si vous voulez ajouter des métadonnées sur l'endroit où vous avez obtenu ce morceau de texte, vous pouvez facilement le faire avec la clé de métadonnées.

```python
metadata = {"source": "internet", "date": "Friday"}
```

```python
doc = Document(page_content=text, metadata=metadata)
```
