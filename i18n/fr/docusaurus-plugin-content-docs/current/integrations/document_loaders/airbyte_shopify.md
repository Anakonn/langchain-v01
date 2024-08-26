---
translated: true
---

# Airbyte Shopify (Déprécié)

Remarque : Ce chargeur spécifique au connecteur est déprécié. Veuillez utiliser [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) à la place.

>[Airbyte](https://github.com/airbytehq/airbyte) est une plateforme d'intégration de données pour les pipelines ELT à partir d'API, de bases de données et de fichiers vers des entrepôts de données et des lacs. Il possède le plus grand catalogue de connecteurs ELT vers des entrepôts de données et des bases de données.

Ce chargeur expose le connecteur Shopify en tant que chargeur de documents, vous permettant de charger divers objets Shopify en tant que documents.

## Installation

Tout d'abord, vous devez installer le package python `airbyte-source-shopify`.

```python
%pip install --upgrade --quiet  airbyte-source-shopify
```

## Exemple

Consultez la [page de documentation d'Airbyte](https://docs.airbyte.com/integrations/sources/shopify/) pour plus de détails sur la configuration du lecteur.
Le schéma JSON auquel l'objet de configuration doit se conformer peut être trouvé sur Github : [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-shopify/source_shopify/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-shopify/source_shopify/spec.json).

La forme générale ressemble à ceci :

```python
{
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
    "shop": "<name of the shop you want to retrieve documents from>",
    "credentials": {
        "auth_method": "api_password",
        "api_password": "<your api password>"
    }
}
```

Par défaut, tous les champs sont stockés en tant que métadonnées dans les documents et le texte est défini sur une chaîne vide. Construisez le texte du document en transformant les documents renvoyés par le lecteur.

```python
from langchain_community.document_loaders.airbyte import AirbyteShopifyLoader

config = {
    # your shopify configuration
}

loader = AirbyteShopifyLoader(
    config=config, stream_name="orders"
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

Gardez à l'esprit que par défaut, le contenu de la page est vide et l'objet de métadonnées contient toutes les informations du record. Pour créer des documents d'une manière différente, passez une fonction `record_handler` lors de la création du chargeur :

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteShopifyLoader(
    config=config, record_handler=handle_record, stream_name="orders"
)
docs = loader.load()
```

## Chargements incrémentiels

Certains flux permettent un chargement incrémentiel, ce qui signifie que la source garde une trace des enregistrements synchronisés et ne les chargera pas à nouveau. Cela est utile pour les sources qui ont un volume élevé de données et sont mises à jour fréquemment.

Pour tirer parti de cela, stockez la propriété `last_state` du chargeur et transmettez-la lors de la création du chargeur à nouveau. Cela garantira que seuls les nouveaux enregistrements sont chargés.

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteShopifyLoader(
    config=config, stream_name="orders", state=last_state
)

new_docs = incremental_loader.load()
```
