---
translated: true
---

# Slack

>[Slack](https://slack.com/) est un programme de messagerie instantanée.

Ce notebook couvre comment charger des documents à partir d'un fichier Zipfile généré à partir d'une exportation `Slack`.

Afin d'obtenir cette exportation `Slack`, suivez ces instructions :

## 🧑 Instructions pour ingérer votre propre jeu de données

Exportez vos données Slack. Vous pouvez le faire en allant sur la page de gestion de votre espace de travail et en cliquant sur l'option Importer/Exporter ({your_slack_domain}.slack.com/services/export). Ensuite, choisissez la bonne plage de dates et cliquez sur `Démarrer l'exportation`. Slack vous enverra un e-mail et un message direct lorsque l'exportation sera prête.

Le téléchargement produira un fichier `.zip` dans votre dossier Téléchargements (ou où que se trouvent vos téléchargements, selon la configuration de votre système d'exploitation).

Copiez le chemin du fichier `.zip` et assignez-le à `LOCAL_ZIPFILE` ci-dessous.

```python
from langchain_community.document_loaders import SlackDirectoryLoader
```

```python
# Optionally set your Slack URL. This will give you proper URLs in the docs sources.
SLACK_WORKSPACE_URL = "https://xxx.slack.com"
LOCAL_ZIPFILE = ""  # Paste the local paty to your Slack zip file here.

loader = SlackDirectoryLoader(LOCAL_ZIPFILE, SLACK_WORKSPACE_URL)
```

```python
docs = loader.load()
docs
```
