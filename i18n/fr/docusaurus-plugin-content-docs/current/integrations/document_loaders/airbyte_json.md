---
translated: true
---

# Airbyte JSON (Déprécié)

Remarque : `AirbyteJSONLoader` est déprécié. Veuillez utiliser [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) à la place.

>[Airbyte](https://github.com/airbytehq/airbyte) est une plateforme d'intégration de données pour les pipelines ELT à partir d'API, de bases de données et de fichiers vers des entrepôts de données et des lacs. Il possède le plus grand catalogue de connecteurs ELT vers des entrepôts de données et des bases de données.

Cela couvre comment charger n'importe quelle source d'Airbyte dans un fichier JSON local qui peut être lu en tant que document

Prérequis :
Avoir Docker Desktop installé

Étapes :

1) Cloner Airbyte depuis GitHub - `git clone https://github.com/airbytehq/airbyte.git`

2) Passer dans le répertoire Airbyte - `cd airbyte`

3) Démarrer Airbyte - `docker compose up`

4) Dans votre navigateur, visitez simplement http://localhost:8000. Vous serez invité à saisir un nom d'utilisateur et un mot de passe. Par défaut, c'est le nom d'utilisateur `airbyte` et le mot de passe `password`.

5) Configurer n'importe quelle source que vous souhaitez.

6) Définir la destination comme JSON local, avec le chemin de destination spécifié - disons `/json_data`. Configurer une synchronisation manuelle.

7) Exécuter la connexion.

7) Pour voir quels fichiers sont créés, vous pouvez naviguer jusqu'à : `file:///tmp/airbyte_local`

8) Trouvez vos données et copiez le chemin. Ce chemin doit être enregistré dans la variable de fichier ci-dessous. Il doit commencer par `/tmp/airbyte_local`

```python
from langchain_community.document_loaders import AirbyteJSONLoader
```

```python
!ls /tmp/airbyte_local/json_data/
```

```output
_airbyte_raw_pokemon.jsonl
```

```python
loader = AirbyteJSONLoader("/tmp/airbyte_local/json_data/_airbyte_raw_pokemon.jsonl")
```

```python
data = loader.load()
```

```python
print(data[0].page_content[:500])
```

```output
abilities:
ability:
name: blaze
url: https://pokeapi.co/api/v2/ability/66/

is_hidden: False
slot: 1


ability:
name: solar-power
url: https://pokeapi.co/api/v2/ability/94/

is_hidden: True
slot: 3

base_experience: 267
forms:
name: charizard
url: https://pokeapi.co/api/v2/pokemon-form/6/

game_indices:
game_index: 180
version:
name: red
url: https://pokeapi.co/api/v2/version/1/



game_index: 180
version:
name: blue
url: https://pokeapi.co/api/v2/version/2/



game_index: 180
version:
n
```
