---
translated: true
---

# AirbyteLoader

>[Airbyte](https://github.com/airbytehq/airbyte) est une plateforme d'intégration de données pour les pipelines ELT à partir d'API, de bases de données et de fichiers vers des entrepôts de données et des lacs. Il dispose du plus grand catalogue de connecteurs ELT vers des entrepôts de données et des bases de données.

Cela couvre comment charger n'importe quelle source d'Airbyte dans les documents LangChain.

## Installation

Pour utiliser `AirbyteLoader`, vous devez installer le package d'intégration `langchain-airbyte`.

```python
% pip install -qU langchain-airbyte
```

Remarque : Actuellement, la bibliothèque `airbyte` ne prend pas en charge Pydantic v2.
Veuillez rétrograder vers Pydantic v1 pour utiliser ce package.

Remarque : Ce package nécessite également Python 3.10+ actuellement.

## Chargement des documents

Par défaut, `AirbyteLoader` chargera toutes les données structurées d'un flux et produira des documents au format YAML.

```python
from langchain_airbyte import AirbyteLoader

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
)
docs = loader.load()
print(docs[0].page_content[:500])
```

```yaml
academic_degree: PhD
address:
  city: Lauderdale Lakes
  country_code: FI
  postal_code: '75466'
  province: New Jersey
  state: Hawaii
  street_name: Stoneyford
  street_number: '1112'
age: 44
blood_type: "O\u2212"
created_at: '2004-04-02T13:05:27+00:00'
email: bread2099+1@outlook.com
gender: Fluid
height: '1.62'
id: 1
language: Belarusian
name: Moses
nationality: Dutch
occupation: Track Worker
telephone: 1-467-194-2318
title: M.Sc.Tech.
updated_at: '2024-02-27T16:41:01+00:00'
weight: 6
```

Vous pouvez également spécifier un modèle d'invite personnalisé pour formater les documents :

```python
from langchain_core.prompts import PromptTemplate

loader_templated = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)
docs_templated = loader_templated.load()
print(docs_templated[0].page_content)
```

```output
My name is Verdie and I am 1.73 meters tall.
```

## Chargement paresseux des documents

L'une des fonctionnalités puissantes de `AirbyteLoader` est sa capacité à charger de gros documents à partir de sources en amont. Lors du travail avec de gros jeux de données, le comportement par défaut de `.load()` peut être lent et gourmand en mémoire. Pour éviter cela, vous pouvez utiliser la méthode `.lazy_load()` pour charger les documents de manière plus économe en mémoire.

```python
import time

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

start_time = time.time()
my_iterator = loader.lazy_load()
print(
    f"Just calling lazy load is quick! This took {time.time() - start_time:.4f} seconds"
)
```

```output
Just calling lazy load is quick! This took 0.0001 seconds
```

Et vous pouvez itérer sur les documents au fur et à mesure qu'ils sont générés :

```python
for doc in my_iterator:
    print(doc.page_content)
```

```output
My name is Andera and I am 1.91 meters tall.
My name is Jody and I am 1.85 meters tall.
My name is Zonia and I am 1.53 meters tall.
```

Vous pouvez également charger paresseusement les documents de manière asynchrone avec `.alazy_load()` :

```python
loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

my_async_iterator = loader.alazy_load()

async for doc in my_async_iterator:
    print(doc.page_content)
```

```output
My name is Carmelina and I am 1.74 meters tall.
My name is Ali and I am 1.90 meters tall.
My name is Rochell and I am 1.83 meters tall.
```

## Configuration

`AirbyteLoader` peut être configuré avec les options suivantes :

- `source` (str, obligatoire) : Le nom de la source Airbyte à charger.
- `stream` (str, obligatoire) : Le nom du flux à charger (les sources Airbyte peuvent renvoyer plusieurs flux)
- `config` (dict, obligatoire) : La configuration de la source Airbyte
- `template` (PromptTemplate, facultatif) : Un modèle d'invite personnalisé pour formater les documents
- `include_metadata` (bool, facultatif, par défaut True) : Si l'on doit inclure tous les champs en tant que métadonnées dans les documents de sortie

La majeure partie de la configuration se trouvera dans `config`, et vous pouvez trouver les options de configuration spécifiques dans la "Référence des champs de configuration" de chaque source dans la [documentation Airbyte](https://docs.airbyte.com/integrations/).
