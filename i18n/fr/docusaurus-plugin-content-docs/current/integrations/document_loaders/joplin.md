---
translated: true
---

# Joplin

>[Joplin](https://joplinapp.org/) est une application de prise de notes open-source. Capturez vos pensées et y accédez en toute sécurité depuis n'importe quel appareil.

Ce cahier couvre comment charger des documents à partir d'une base de données `Joplin`.

`Joplin` dispose d'une [API REST](https://joplinapp.org/api/references/rest_api/) pour accéder à sa base de données locale. Ce chargeur utilise l'API pour récupérer toutes les notes de la base de données et leurs métadonnées. Cela nécessite un jeton d'accès qui peut être obtenu à partir de l'application en suivant ces étapes :

1. Ouvrez l'application `Joplin`. L'application doit rester ouverte pendant le chargement des documents.
2. Allez dans les paramètres / options et sélectionnez "Web Clipper".
3. Assurez-vous que le service Web Clipper est activé.
4. Dans "Options avancées", copiez le jeton d'autorisation.

Vous pouvez soit initialiser le chargeur directement avec le jeton d'accès, soit le stocker dans la variable d'environnement JOPLIN_ACCESS_TOKEN.

Une alternative à cette approche consiste à exporter la base de données de notes `Joplin` dans des fichiers Markdown (éventuellement avec des métadonnées Front Matter) et à utiliser un chargeur Markdown, comme ObsidianLoader, pour les charger.

```python
from langchain_community.document_loaders import JoplinLoader
```

```python
loader = JoplinLoader(access_token="<access-token>")
```

```python
docs = loader.load()
```
