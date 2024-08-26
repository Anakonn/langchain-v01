---
translated: true
---

# acreom

[acreom](https://acreom.com) est une base de connaissances orientée développeur avec des tâches s'exécutant sur des fichiers markdown locaux.

Voici un exemple de chargement d'un coffre-fort acreom local dans Langchain. Comme le coffre-fort local dans acreom est un dossier de fichiers .md texte brut, le chargeur nécessite le chemin du répertoire.

Les fichiers du coffre-fort peuvent contenir des métadonnées stockées dans un en-tête YAML. Ces valeurs seront ajoutées aux métadonnées du document si `collect_metadata` est défini sur true.

```python
from langchain_community.document_loaders import AcreomLoader
```

```python
loader = AcreomLoader("<path-to-acreom-vault>", collect_metadata=False)
```

```python
docs = loader.load()
```
