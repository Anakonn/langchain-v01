---
translated: true
---

# Notion DB 2/2

>[Notion](https://www.notion.so/) est une plateforme de collaboration avec un support Markdown modifié qui intègre des tableaux kanban, des tâches, des wikis et des bases de données. C'est un espace de travail tout-en-un pour la prise de notes, la gestion des connaissances et des données, ainsi que la gestion de projets et de tâches.

`NotionDBLoader` est une classe Python pour charger le contenu d'une base de données `Notion`. Elle récupère les pages de la base de données, lit leur contenu et renvoie une liste d'objets Document.

## Exigences

- Une base de données `Notion`
- Jeton d'intégration Notion

## Configuration

### 1. Créer une base de données de table Notion

Créez une nouvelle base de données de table dans Notion. Vous pouvez ajouter n'importe quelle colonne à la base de données et elles seront traitées comme des métadonnées. Par exemple, vous pouvez ajouter les colonnes suivantes :

- Titre : définissez Titre comme propriété par défaut.
- Catégories : une propriété de sélection multiple pour stocker les catégories associées à la page.
- Mots-clés : une propriété de sélection multiple pour stocker les mots-clés associés à la page.

Ajoutez votre contenu au corps de chaque page de la base de données. Le NotionDBLoader extrait le contenu et les métadonnées de ces pages.

## 2. Créer une intégration Notion

Pour créer une intégration Notion, suivez ces étapes :

1. Visitez la page [Notion Developers](https://www.notion.com/my-integrations) et connectez-vous avec votre compte Notion.
2. Cliquez sur le bouton "+ Nouvelle intégration".
3. Donnez un nom à votre intégration et choisissez l'espace de travail où se trouve votre base de données.
4. Sélectionnez les capacités requises, cette extension a seulement besoin de la capacité Lire le contenu.
5. Cliquez sur le bouton "Soumettre" pour créer l'intégration.
Une fois l'intégration créée, vous recevrez un `Jeton d'intégration (clé API)`. Copiez ce jeton et gardez-le en sécurité, car vous en aurez besoin pour utiliser le NotionDBLoader.

### 3. Connecter l'intégration à la base de données

Pour connecter votre intégration à la base de données, suivez ces étapes :

1. Ouvrez votre base de données dans Notion.
2. Cliquez sur l'icône des trois points dans le coin supérieur droit de la vue de la base de données.
3. Cliquez sur le bouton "+ Nouvelle intégration".
4. Trouvez votre intégration, vous devrez peut-être commencer à taper son nom dans la zone de recherche.
5. Cliquez sur le bouton "Connecter" pour connecter l'intégration à la base de données.

### 4. Obtenir l'ID de la base de données

Pour obtenir l'ID de la base de données, suivez ces étapes :

1. Ouvrez votre base de données dans Notion.
2. Cliquez sur l'icône des trois points dans le coin supérieur droit de la vue de la base de données.
3. Sélectionnez "Copier le lien" dans le menu pour copier l'URL de la base de données dans votre presse-papiers.
4. L'ID de la base de données est la longue chaîne de caractères alphanumériques trouvée dans l'URL. Elle ressemble généralement à ceci : https://www.notion.so/username/8935f9d140a04f95a872520c4f123456?v=.... Dans cet exemple, l'ID de la base de données est 8935f9d140a04f95a872520c4f123456.

Une fois la base de données correctement configurée et les jetons d'intégration et l'ID de la base de données en main, vous pouvez maintenant utiliser le code NotionDBLoader pour charger le contenu et les métadonnées de votre base de données Notion.

## Utilisation

NotionDBLoader fait partie des chargeurs de documents du package langchain. Vous pouvez l'utiliser comme suit :

```python
from getpass import getpass

NOTION_TOKEN = getpass()
DATABASE_ID = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import NotionDBLoader
```

```python
loader = NotionDBLoader(
    integration_token=NOTION_TOKEN,
    database_id=DATABASE_ID,
    request_timeout_sec=30,  # optional, defaults to 10
)
```

```python
docs = loader.load()
```

```python
print(docs)
```
