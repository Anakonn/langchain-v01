---
translated: true
---

# Trello

>[Trello](https://www.atlassian.com/software/trello) est un outil de gestion de projet et de collaboration basé sur le web qui permet aux individus et aux équipes d'organiser et de suivre leurs tâches et leurs projets. Il fournit une interface visuelle connue sous le nom de "tableau" où les utilisateurs peuvent créer des listes et des cartes pour représenter leurs tâches et leurs activités.

Le TrelloLoader vous permet de charger des cartes à partir d'un tableau Trello et est implémenté au-dessus de [py-trello](https://pypi.org/project/py-trello/)

Cela prend en charge uniquement `api_key/token`.

1. Génération des identifiants : https://trello.com/power-ups/admin/

2. Cliquez sur le lien de génération manuelle du jeton pour obtenir le jeton.

Pour spécifier la clé API et le jeton, vous pouvez soit définir les variables d'environnement ``TRELLO_API_KEY`` et ``TRELLO_TOKEN``, soit passer ``api_key`` et ``token`` directement dans la méthode de constructeur de commodité `from_credentials`.

Ce chargeur vous permet de fournir le nom du tableau pour charger les cartes correspondantes dans les objets Document.

Notez que le "nom" du tableau est également appelé "titre" dans la documentation officielle :

https://support.atlassian.com/trello/docs/changing-a-boards-title-and-description/

Vous pouvez également spécifier plusieurs paramètres de chargement pour inclure/supprimer différents champs à la fois dans les propriétés page_content et les métadonnées du document.

## Fonctionnalités

- Charger des cartes à partir d'un tableau Trello.
- Filtrer les cartes en fonction de leur statut (ouvert ou fermé).
- Inclure les noms de cartes, les commentaires et les listes de contrôle dans les documents chargés.
- Personnaliser les champs de métadonnées supplémentaires à inclure dans le document.

Par défaut, tous les champs de carte sont inclus pour le texte intégral page_content et les métadonnées en conséquence.

```python
%pip install --upgrade --quiet  py-trello beautifulsoup4 lxml
```

```python
# If you have already set the API key and token using environment variables,
# you can skip this cell and comment out the `api_key` and `token` named arguments
# in the initialization steps below.
from getpass import getpass

API_KEY = getpass()
TOKEN = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import TrelloLoader

# Get the open cards from "Awesome Board"
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    card_filter="open",
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'labels': ['Demand Marketing'], 'list': 'Done', 'closed': False, 'due_date': ''}
```

```python
# Get all the cards from "Awesome Board" but only include the
# card list(column) as extra metadata.
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    extra_metadata=("list"),
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'list': 'Done'}
```

```python
# Get the cards from "Another Board" and exclude the card name,
# checklist and comments from the Document page_content text.
loader = TrelloLoader.from_credentials(
    "test",
    api_key=API_KEY,
    token=TOKEN,
    include_card_name=False,
    include_checklist=False,
    include_comments=False,
)
documents = loader.load()

print("Document: " + documents[0].page_content)
print(documents[0].metadata)
```
