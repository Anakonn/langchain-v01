---
translated: true
---

# Rockset

> Rockset est une base de données analytique en temps réel qui permet des requêtes sur des données semi-structurées massives sans fardeau opérationnel. Avec Rockset, les données ingérées sont interrogeables en une seconde et les requêtes analytiques sur ces données s'exécutent généralement en quelques millisecondes. Rockset est optimisé pour le calcul, ce qui le rend adapté pour servir des applications à forte concurrence dans la plage de sous-100 To (ou supérieure à 100 To avec des rollups).

Ce notebook montre comment utiliser Rockset comme chargeur de documents dans langchain. Pour commencer, assurez-vous d'avoir un compte Rockset et une clé API disponible.

## Configuration de l'environnement

1. Allez sur la [console Rockset](https://console.rockset.com/apikeys) et obtenez une clé API. Trouvez votre région API dans la [référence API](https://rockset.com/docs/rest-api/#introduction). Pour les besoins de ce notebook, nous supposerons que vous utilisez Rockset depuis `Oregon (us-west-2)`.
2. Définissez la variable d'environnement `ROCKSET_API_KEY`.
3. Installez le client python Rockset, qui sera utilisé par langchain pour interagir avec la base de données Rockset.

```python
%pip install --upgrade --quiet  rockset
```

# Chargement des documents

L'intégration Rockset avec LangChain vous permet de charger des documents à partir de collections Rockset avec des requêtes SQL. Pour ce faire, vous devez construire un objet `RocksetLoader`. Voici un exemple de code qui initialise un `RocksetLoader`.

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 3"),  # SQL query
    ["text"],  # content columns
    metadata_keys=["id", "date"],  # metadata columns
)
```

Ici, vous pouvez voir que la requête suivante est exécutée :

```sql
SELECT * FROM langchain_demo LIMIT 3
```

La colonne `text` de la collection est utilisée comme contenu de la page, et les colonnes `id` et `date` du document sont utilisées comme métadonnées (si vous ne passez rien dans `metadata_keys`, l'ensemble du document Rockset sera utilisé comme métadonnées).

Pour exécuter la requête et accéder à un itérateur sur les `Document`s résultants, exécutez :

```python
loader.lazy_load()
```

Pour exécuter la requête et accéder à tous les `Document`s résultants d'un coup, exécutez :

```python
loader.load()
```

Voici un exemple de réponse de `loader.load()` :

```python
[
    Document(
        page_content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a libero porta, dictum ipsum eget, hendrerit neque. Morbi blandit, ex ut suscipit viverra, enim velit tincidunt tellus, a tempor velit nunc et ex. Proin hendrerit odio nec convallis lobortis. Aenean in purus dolor. Vestibulum orci orci, laoreet eget magna in, commodo euismod justo.",
        metadata={"id": 83209, "date": "2022-11-13T18:26:45.000000Z"}
    ),
    Document(
        page_content="Integer at finibus odio. Nam sit amet enim cursus lacus gravida feugiat vestibulum sed libero. Aenean eleifend est quis elementum tincidunt. Curabitur sit amet ornare erat. Nulla id dolor ut magna volutpat sodales fringilla vel ipsum. Donec ultricies, lacus sed fermentum dignissim, lorem elit aliquam ligula, sed suscipit sapien purus nec ligula.",
        metadata={"id": 89313, "date": "2022-11-13T18:28:53.000000Z"}
    ),
    Document(
        page_content="Morbi tortor enim, commodo id efficitur vitae, fringilla nec mi. Nullam molestie faucibus aliquet. Praesent a est facilisis, condimentum justo sit amet, viverra erat. Fusce volutpat nisi vel purus blandit, et facilisis felis accumsan. Phasellus luctus ligula ultrices tellus tempor hendrerit. Donec at ultricies leo.",
        metadata={"id": 87732, "date": "2022-11-13T18:49:04.000000Z"}
    )
]
```

## Utilisation de plusieurs colonnes comme contenu

Vous pouvez choisir d'utiliser plusieurs colonnes comme contenu :

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],  # TWO content columns
)
```

En supposant que le champ "sentence1" soit `"This is the first sentence."` et que le champ "sentence2" soit `"This is the second sentence."`, le `page_content` du `Document` résultant serait :

```output
This is the first sentence.
This is the second sentence.
```

Vous pouvez définir votre propre fonction pour joindre les colonnes de contenu en définissant l'argument `content_columns_joiner` dans le constructeur de `RocksetLoader`. `content_columns_joiner` est une méthode qui prend en argument une `List[Tuple[str, Any]]]`, représentant une liste de tuples de (nom de colonne, valeur de colonne). Par défaut, il s'agit d'une méthode qui joint chaque valeur de colonne avec un saut de ligne.

Par exemple, si vous vouliez joindre sentence1 et sentence2 avec un espace au lieu d'un saut de ligne, vous pourriez définir `content_columns_joiner` comme ceci :

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: " ".join(
        [doc[1] for doc in docs]
    ),  # join with space instead of /n
)
```

Le `page_content` du `Document` résultant serait :

```output
This is the first sentence. This is the second sentence.
```

Souvent, vous voulez inclure le nom de la colonne dans le `page_content`. Vous pouvez le faire comme ceci :

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: "\n".join(
        [f"{doc[0]}: {doc[1]}" for doc in docs]
    ),
)
```

Cela donnerait le `page_content` suivant :

```output
sentence1: This is the first sentence.
sentence2: This is the second sentence.
```
