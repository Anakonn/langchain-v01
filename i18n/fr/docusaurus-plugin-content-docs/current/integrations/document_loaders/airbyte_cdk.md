---
translated: true
---

# Airbyte CDK (Déprécié)

Remarque : `AirbyteCDKLoader` est déprécié. Veuillez utiliser [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) à la place.

>[Airbyte](https://github.com/airbytehq/airbyte) est une plateforme d'intégration de données pour les pipelines ELT à partir d'API, de bases de données et de fichiers vers des entrepôts de données et des lacs. Il possède le plus grand catalogue de connecteurs ELT vers des entrepôts de données et des bases de données.

De nombreux connecteurs source sont implémentés à l'aide de l'[Airbyte CDK](https://docs.airbyte.com/connector-development/cdk-python/). Ce chargeur permet d'exécuter n'importe lequel de ces connecteurs et de renvoyer les données sous forme de documents.

## Installation

Tout d'abord, vous devez installer le package python `airbyte-cdk`.

```python
%pip install --upgrade --quiet  airbyte-cdk
```

Ensuite, installez un connecteur existant à partir du [dépôt GitHub d'Airbyte](https://github.com/airbytehq/airbyte/tree/master/airbyte-integrations/connectors) ou créez votre propre connecteur à l'aide de l'[Airbyte CDK](https://docs.airbyte.io/connector-development/connector-development).

Par exemple, pour installer le connecteur Github, exécutez

```python
%pip install --upgrade --quiet  "source_github@git+https://github.com/airbytehq/airbyte.git@master#subdirectory=airbyte-integrations/connectors/source-github"
```

Certaines sources sont également publiées en tant que packages réguliers sur PyPI.

## Exemple

Vous pouvez maintenant créer un `AirbyteCDKLoader` basé sur la source importée. Il prend un objet `config` qui est transmis au connecteur. Vous devez également choisir le flux à partir duquel vous voulez récupérer les enregistrements par leur nom (`stream_name`). Consultez la page de documentation du connecteur et la définition du schéma pour plus d'informations sur l'objet de configuration et les flux disponibles. Pour les connecteurs Github, il s'agit de :

* [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json).
* [https://docs.airbyte.com/integrations/sources/github/](https://docs.airbyte.com/integrations/sources/github/)

```python
from langchain_community.document_loaders.airbyte import AirbyteCDKLoader
from source_github.source import SourceGithub  # plug in your own source here

config = {
    # your github configuration
    "credentials": {"api_url": "api.github.com", "personal_access_token": "<token>"},
    "repository": "<repo>",
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues"
)
```

Vous pouvez maintenant charger les documents de la manière habituelle.

```python
docs = issues_loader.load()
```

Comme `load` renvoie une liste, il bloquera jusqu'à ce que tous les documents soient chargés. Pour avoir un meilleur contrôle sur ce processus, vous pouvez également utiliser la méthode `lazy_load` qui renvoie un itérateur :

```python
docs_iterator = issues_loader.lazy_load()
```

Gardez à l'esprit que par défaut, le contenu de la page est vide et l'objet de métadonnées contient toutes les informations de l'enregistrement. Pour créer des documents d'une manière différente, passez une fonction `record_handler` lors de la création du chargeur :

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(
        page_content=record.data["title"] + "\n" + (record.data["body"] or ""),
        metadata=record.data,
    )


issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub,
    config=config,
    stream_name="issues",
    record_handler=handle_record,
)

docs = issues_loader.load()
```

## Chargements incrémentiels

Certains flux permettent un chargement incrémentiel, ce qui signifie que la source garde une trace des enregistrements synchronisés et ne les chargera pas à nouveau. Cela est utile pour les sources qui ont un volume de données élevé et sont mises à jour fréquemment.

Pour tirer parti de cette fonctionnalité, stockez la propriété `last_state` du chargeur et transmettez-la lors de la création du chargeur suivant. Cela garantira que seuls les nouveaux enregistrements sont chargés.

```python
last_state = issues_loader.last_state  # store safely

incremental_issue_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues", state=last_state
)

new_docs = incremental_issue_loader.load()
```
