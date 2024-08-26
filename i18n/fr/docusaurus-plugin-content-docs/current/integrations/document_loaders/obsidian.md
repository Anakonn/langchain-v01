---
translated: true
---

# Obsidian

>[Obsidian](https://obsidian.md/) est une base de connaissances puissante et extensible
qui fonctionne sur votre dossier local de fichiers texte brut.

Ce cahier couvre comment charger des documents à partir d'une base de données `Obsidian`.

Puisque `Obsidian` est simplement stocké sur le disque sous forme d'un dossier de fichiers Markdown, le chargeur prend juste un chemin vers ce répertoire.

Les fichiers `Obsidian` contiennent parfois également des [métadonnées](https://help.obsidian.md/Editing+and+formatting/Metadata) qui sont un bloc YAML en haut du fichier. Ces valeurs seront ajoutées aux métadonnées du document. (`ObsidianLoader` peut également être passé un argument `collect_metadata=False` pour désactiver ce comportement.)

```python
from langchain_community.document_loaders import ObsidianLoader
```

```python
loader = ObsidianLoader("<path-to-obsidian>")
```

```python
docs = loader.load()
```
