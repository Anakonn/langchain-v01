---
translated: true
---

# Airtable

>[Airtable](https://en.wikipedia.org/wiki/Airtable) est un service de collaboration dans le cloud.
`Airtable` est un hybride feuille de calcul-base de données, avec les fonctionnalités d'une base de données mais appliquées à une feuille de calcul.
> Les champs d'une table Airtable sont similaires à des cellules dans une feuille de calcul, mais ont des types tels que 'case à cocher',
> 'numéro de téléphone' et 'liste déroulante', et peuvent faire référence à des pièces jointes comme des images.

>Les utilisateurs peuvent créer une base de données, configurer les types de colonnes, ajouter des enregistrements, relier des tables les unes aux autres, collaborer, trier les enregistrements
> et publier des vues sur des sites Web externes.

## Installation et configuration

```bash
pip install pyairtable
```

* Obtenez votre [clé API](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens).
* Obtenez l'[ID de votre base](https://airtable.com/developers/web/api/introduction).
* Obtenez l'[ID de table à partir de l'URL de la table](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl).

## Chargeur de documents

```python
<!--IMPORTS:[{"imported": "AirtableLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.airtable.AirtableLoader.html", "title": "Airtable"}]-->
from langchain_community.document_loaders import AirtableLoader
```

Voir un [exemple](/docs/integrations/document_loaders/airtable).
