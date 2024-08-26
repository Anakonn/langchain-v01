---
translated: true
---

# Quip

>[Quip](https://quip.com) est une suite logicielle de productivité collaborative pour mobile et Web. Elle permet à des groupes de personnes de créer et de modifier des documents et des feuilles de calcul en groupe, généralement à des fins professionnelles.

Un chargeur pour les documents `Quip`.

Veuillez vous référer [ici](https://quip.com/dev/automation/documentation/current#section/Authentication/Get-Access-to-Quip's-APIs) pour savoir comment obtenir un jeton d'accès personnel.

Spécifiez une liste `folder_ids` et/ou `thread_ids` pour charger les documents correspondants dans des objets Document, si les deux sont spécifiés, le chargeur récupérera tous les `thread_ids` appartenant à ce dossier en fonction des `folder_ids`, les combinera avec les `thread_ids` passés, l'union des deux ensembles sera renvoyée.

* Comment connaître le folder_id ?
  Allez dans le dossier Quip, cliquez avec le bouton droit sur le dossier et copiez le lien, extrayez le suffixe du lien comme folder_id. Indice : `https://example.quip.com/<folder_id>`
* Comment connaître le thread_id ?
  Le thread_id est l'identifiant du document. Allez dans le document Quip, cliquez avec le bouton droit sur le document et copiez le lien, extrayez le suffixe du lien comme thread_id. Indice : `https://exmaple.quip.com/<thread_id>`

Vous pouvez également définir `include_all_folders` sur `True` pour récupérer les group_folder_ids et
Vous pouvez également spécifier un booléen `include_attachments` pour inclure les pièces jointes, cette option est définie sur False par défaut, si elle est définie sur True, toutes les pièces jointes seront téléchargées et QuipLoader extraira le texte des pièces jointes et l'ajoutera à l'objet Document. Les types de pièces jointes actuellement pris en charge sont : `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` et `Excel`. Vous pouvez également spécifier un booléen `include_comments` pour inclure les commentaires dans le document, cette option est définie sur False par défaut, si elle est définie sur True, tous les commentaires du document seront récupérés et QuipLoader les ajoutera à l'objet Document.

Avant d'utiliser QuipLoader, assurez-vous d'avoir la dernière version du package quip-api installée :

```python
%pip install --upgrade --quiet  quip-api
```

## Exemples

### Jeton d'accès personnel

```python
from langchain_community.document_loaders.quip import QuipLoader

loader = QuipLoader(
    api_url="https://platform.quip.com", access_token="change_me", request_timeout=60
)
documents = loader.load(
    folder_ids={"123", "456"},
    thread_ids={"abc", "efg"},
    include_attachments=False,
    include_comments=False,
)
```
