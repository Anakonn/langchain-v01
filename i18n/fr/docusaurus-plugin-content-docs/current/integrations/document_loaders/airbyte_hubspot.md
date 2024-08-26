---
translated: true
---

# Airbyte Hubspot (Déprécié)

Remarque : `AirbyteHubspotLoader` est déprécié. Veuillez utiliser [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) à la place.

>[Airbyte](https://github.com/airbytehq/airbyte) est une plateforme d'intégration de données pour les pipelines ELT à partir d'API, de bases de données et de fichiers vers des entrepôts de données et des lacs. Il dispose du plus grand catalogue de connecteurs ELT vers des entrepôts de données et des bases de données.

Ce chargeur expose le connecteur Hubspot en tant que chargeur de documents, vous permettant de charger divers objets Hubspot en tant que documents.

## Installation

Tout d'abord, vous devez installer le package python `airbyte-source-hubspot`.

```python
%pip install --upgrade --quiet  airbyte-source-hubspot
```

## Exemple

Consultez la [page de documentation Airbyte](https://docs.airbyte.com/integrations/sources/hubspot/) pour plus de détails sur la configuration du lecteur.
Le schéma JSON auquel l'objet de configuration doit se conformer peut être trouvé sur Github : [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-hubspot/source_hubspot/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-hubspot/source_hubspot/spec.yaml).

La forme générale ressemble à ceci :

```python
{
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "credentials": {
    "credentials_title": "Private App Credentials",
    "access_token": "<access token of your private app>"
  }
}
```

Par défaut, tous les champs sont stockés en tant que métadonnées dans les documents et le texte est défini sur une chaîne vide. Construisez le texte du document en transformant les documents renvoyés par le lecteur.

```python
from langchain_community.document_loaders.airbyte import AirbyteHubspotLoader

config = {
    # your hubspot configuration
}

loader = AirbyteHubspotLoader(
    config=config, stream_name="products"
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

Gardez à l'esprit que par défaut, le contenu de la page est vide et l'objet de métadonnées contient toutes les informations du dossier. Pour traiter les documents, créez une classe héritant du chargeur de base et implémentez vous-même la méthode `_handle_records` :

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteHubspotLoader(
    config=config, record_handler=handle_record, stream_name="products"
)
docs = loader.load()
```

## Chargements incrémentiels

Certains flux permettent un chargement incrémentiel, ce qui signifie que la source garde une trace des enregistrements synchronisés et ne les chargera pas à nouveau. Cela est utile pour les sources qui ont un volume élevé de données et sont mises à jour fréquemment.

Pour tirer parti de cela, stockez la propriété `last_state` du chargeur et transmettez-la lors de la création du chargeur à nouveau. Cela garantira que seuls les nouveaux enregistrements sont chargés.

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteHubspotLoader(
    config=config, stream_name="products", state=last_state
)

new_docs = incremental_loader.load()
```
