---
translated: true
---

# Airbyte Typeform (Déprécié)

Remarque : Ce chargeur de connecteur spécifique est déprécié. Veuillez utiliser [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) à la place.

>[Airbyte](https://github.com/airbytehq/airbyte) est une plateforme d'intégration de données pour les pipelines ELT à partir d'API, de bases de données et de fichiers vers des entrepôts de données et des lacs. Il possède le plus grand catalogue de connecteurs ELT vers des entrepôts de données et des bases de données.

Ce chargeur expose le connecteur Typeform en tant que chargeur de documents, vous permettant de charger divers objets Typeform en tant que documents.

## Installation

Tout d'abord, vous devez installer le package python `airbyte-source-typeform`.

```python
%pip install --upgrade --quiet  airbyte-source-typeform
```

## Exemple

Consultez la [page de documentation d'Airbyte](https://docs.airbyte.com/integrations/sources/typeform/) pour plus de détails sur la configuration du lecteur.
Le schéma JSON auquel l'objet de configuration doit se conformer peut être trouvé sur Github : [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-typeform/source_typeform/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-typeform/source_typeform/spec.json).

La forme générale ressemble à ceci :

```python
{
  "credentials": {
    "auth_type": "Private Token",
    "access_token": "<your auth token>"
  },
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "form_ids": ["<id of form to load records for>"] # if omitted, records from all forms will be loaded
}
```

Par défaut, tous les champs sont stockés en tant que métadonnées dans les documents et le texte est défini sur une chaîne vide. Construisez le texte du document en transformant les documents renvoyés par le lecteur.

```python
from langchain_community.document_loaders.airbyte import AirbyteTypeformLoader

config = {
    # your typeform configuration
}

loader = AirbyteTypeformLoader(
    config=config, stream_name="forms"
)  # check the documentation linked above for a list of all streams
```

Vous pouvez maintenant charger les documents de la manière habituelle

```python
docs = loader.load()
```

Comme `load` renvoie une liste, elle bloquera jusqu'à ce que tous les documents soient chargés. Pour avoir un meilleur contrôle sur ce processus, vous pouvez également utiliser la méthode `lazy_load` qui renvoie un itérateur :

```python
docs_iterator = loader.lazy_load()
```

Gardez à l'esprit que par défaut, le contenu de la page est vide et l'objet de métadonnées contient toutes les informations du dossier. Pour créer des documents différemment, passez une fonction `record_handler` lors de la création du chargeur :

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteTypeformLoader(
    config=config, record_handler=handle_record, stream_name="forms"
)
docs = loader.load()
```

## Chargements incrémentiels

Certains flux permettent un chargement incrémentiel, ce qui signifie que la source garde une trace des enregistrements synchronisés et ne les chargera pas à nouveau. Cela est utile pour les sources qui ont un volume élevé de données et sont mises à jour fréquemment.

Pour tirer parti de cela, stockez la propriété `last_state` du chargeur et transmettez-la lors de la création du chargeur à nouveau. Cela garantira que seuls les nouveaux enregistrements sont chargés.

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteTypeformLoader(
    config=config, record_handler=handle_record, stream_name="forms", state=last_state
)

new_docs = incremental_loader.load()
```
