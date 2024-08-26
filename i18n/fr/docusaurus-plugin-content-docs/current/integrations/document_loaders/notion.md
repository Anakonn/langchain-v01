---
translated: true
---

# Notion DB 1/2

>[Notion](https://www.notion.so/) est une plateforme de collaboration avec un support Markdown modifié qui intègre des tableaux kanban, des tâches, des wikis et des bases de données. C'est un espace de travail tout-en-un pour la prise de notes, la gestion des connaissances et des données, ainsi que la gestion des projets et des tâches.

Ce cahier couvre comment charger des documents à partir d'un vidage de base de données Notion.

Afin d'obtenir ce vidage Notion, suivez ces instructions :

## 🧑 Instructions pour ingérer votre propre jeu de données

Exportez votre jeu de données depuis Notion. Vous pouvez le faire en cliquant sur les trois points dans le coin supérieur droit, puis en cliquant sur `Exporter`.

Lors de l'exportation, assurez-vous de sélectionner l'option de format `Markdown & CSV`.

Cela produira un fichier `.zip` dans votre dossier Téléchargements. Déplacez le fichier `.zip` dans ce référentiel.

Exécutez la commande suivante pour décompresser le fichier zip (remplacez `Export...` par le nom de votre propre fichier au besoin).

```shell
unzip Export-d3adfe0f-3131-4bf3-8987-a52017fc1bae.zip -d Notion_DB
```

Exécutez la commande suivante pour ingérer les données.

```python
from langchain_community.document_loaders import NotionDirectoryLoader
```

```python
loader = NotionDirectoryLoader("Notion_DB")
```

```python
docs = loader.load()
```
