---
translated: true
---

# DataForSEO

>[DataForSeo](https://dataforseo.com/) fournit des solutions de données complètes pour le référencement naturel (SEO) et le marketing numérique via une API.
>
>L'`API DataForSeo` récupère les `SERP` (résultats de recherche) des moteurs de recherche les plus populaires comme `Google`, `Bing`, `Yahoo`. Elle permet également d'obtenir des SERP à partir de différents types de moteurs de recherche comme `Maps`, `News`, `Events`, etc.

Ce notebook montre comment utiliser l'[API DataForSeo](https://dataforseo.com/apis) pour obtenir les résultats des moteurs de recherche.

```python
from langchain_community.utilities.dataforseo_api_search import DataForSeoAPIWrapper
```

## Configuration des identifiants de l'API

Vous pouvez obtenir vos identifiants d'API en vous inscrivant sur le site web `DataForSeo`.

```python
import os

os.environ["DATAFORSEO_LOGIN"] = "your_api_access_username"
os.environ["DATAFORSEO_PASSWORD"] = "your_api_access_password"

wrapper = DataForSeoAPIWrapper()
```

La méthode `run` renverra l'extrait du premier résultat parmi les éléments suivants : `answer_box`, `knowledge_graph`, `featured_snippet`, `shopping`, `organic`.

```python
wrapper.run("Weather in Los Angeles")
```

## La différence entre `run` et `results`

`run` et `results` sont deux méthodes fournies par la classe `DataForSeoAPIWrapper`.

La méthode `run` exécute la recherche et renvoie l'extrait du premier résultat de la boîte de réponse, du graphique de connaissances, de l'extrait mis en avant, des résultats shopping ou des résultats organiques. Ces éléments sont triés par ordre de priorité, du plus élevé au plus faible.

La méthode `results` renvoie une réponse JSON configurée selon les paramètres définis dans le wrapper. Cela permet une plus grande flexibilité dans les données que vous souhaitez récupérer via l'API.

## Obtenir les résultats au format JSON

Vous pouvez personnaliser les types de résultats et les champs que vous souhaitez récupérer dans la réponse JSON. Vous pouvez également définir un nombre maximum de résultats à renvoyer.

```python
json_wrapper = DataForSeoAPIWrapper(
    json_result_types=["organic", "knowledge_graph", "answer_box"],
    json_result_fields=["type", "title", "description", "text"],
    top_count=3,
)
```

```python
json_wrapper.results("Bill Gates")
```

## Personnaliser la localisation et la langue

Vous pouvez spécifier la localisation et la langue des résultats de recherche en passant des paramètres supplémentaires au wrapper de l'API.

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en"},
)
customized_wrapper.results("coffee near me")
```

## Personnaliser le moteur de recherche

Vous pouvez également spécifier le moteur de recherche que vous souhaitez utiliser.

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en", "se_name": "bing"},
)
customized_wrapper.results("coffee near me")
```

## Personnaliser le type de recherche

Le wrapper de l'API vous permet également de spécifier le type de recherche que vous souhaitez effectuer. Par exemple, vous pouvez effectuer une recherche sur les cartes.

```python
maps_search = DataForSeoAPIWrapper(
    top_count=10,
    json_result_fields=["title", "value", "address", "rating", "type"],
    params={
        "location_coordinate": "52.512,13.36,12z",
        "language_code": "en",
        "se_type": "maps",
    },
)
maps_search.results("coffee near me")
```

## Intégration avec les agents Langchain

Vous pouvez utiliser la classe `Tool` du module `langchain.agents` pour intégrer le `DataForSeoAPIWrapper` à un agent Langchain. La classe `Tool` encapsule une fonction que l'agent peut appeler.

```python
from langchain.agents import Tool

search = DataForSeoAPIWrapper(
    top_count=3,
    json_result_types=["organic"],
    json_result_fields=["title", "description", "type"],
)
tool = Tool(
    name="google-search-answer",
    description="My new answer tool",
    func=search.run,
)
json_tool = Tool(
    name="google-search-json",
    description="My new json tool",
    func=search.results,
)
```
