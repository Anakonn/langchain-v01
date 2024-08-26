---
translated: true
---

# Roam

>[ROAM](https://roamresearch.com/) est un outil de prise de notes pour la pensée en réseau, conçu pour créer une base de connaissances personnelle.

Ce cahier couvre comment charger des documents à partir d'une base de données Roam. Cela s'inspire beaucoup de l'exemple de dépôt [ici](https://github.com/JimmyLv/roam-qa).

## 🧑 Instructions pour ingérer votre propre jeu de données

Exportez votre jeu de données de Roam Research. Vous pouvez le faire en cliquant sur les trois points dans le coin supérieur droit, puis en cliquant sur `Exporter`.

Lors de l'exportation, assurez-vous de sélectionner l'option de format `Markdown & CSV`.

Cela produira un fichier `.zip` dans votre dossier Téléchargements. Déplacez le fichier `.zip` dans ce référentiel.

Exécutez la commande suivante pour décompresser le fichier zip (remplacez `Export...` par le nom de votre propre fichier au besoin).

```shell
unzip Roam-Export-1675782732639.zip -d Roam_DB
```

```python
from langchain_community.document_loaders import RoamLoader
```

```python
loader = RoamLoader("Roam_DB")
```

```python
docs = loader.load()
```
