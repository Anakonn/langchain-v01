---
translated: true
---

# Jeu de données Apify

>[Jeu de données Apify](https://docs.apify.com/platform/storage/dataset) est un stockage évolutif en ajout uniquement avec un accès séquentiel conçu pour stocker les résultats de web scraping structurés, comme une liste de produits ou les résultats de recherche Google, puis les exporter dans divers formats comme JSON, CSV ou Excel. Les jeux de données sont principalement utilisés pour enregistrer les résultats des [acteurs Apify](https://apify.com/store) - programmes cloud sans serveur pour divers cas d'utilisation de web scraping, de crawling et d'extraction de données.

Ce notebook montre comment charger les jeux de données Apify dans LangChain.

## Prérequis

Vous devez avoir un jeu de données existant sur la plateforme Apify. Si vous n'en avez pas, veuillez d'abord consulter [ce notebook](/docs/integrations/tools/apify) sur la façon d'utiliser Apify pour extraire du contenu de la documentation, des bases de connaissances, des centres d'aide ou des blogs.

```python
%pip install --upgrade --quiet  apify-client
```

Tout d'abord, importez `ApifyDatasetLoader` dans votre code source :

```python
from langchain_community.document_loaders import ApifyDatasetLoader
from langchain_core.documents import Document
```

Ensuite, fournissez une fonction qui mappe les champs d'enregistrement du jeu de données Apify au format `Document` de LangChain.

Par exemple, si vos éléments de jeu de données sont structurés comme ceci :

```json
{
    "url": "https://apify.com",
    "text": "Apify is the best web scraping and automation platform."
}
```

La fonction de mappage dans le code ci-dessous les convertira au format `Document` de LangChain, afin que vous puissiez les utiliser davantage avec n'importe quel modèle LLM (par exemple pour la réponse aux questions).

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda dataset_item: Document(
        page_content=dataset_item["text"], metadata={"source": dataset_item["url"]}
    ),
)
```

```python
data = loader.load()
```

## Un exemple avec la réponse aux questions

Dans cet exemple, nous utilisons les données d'un jeu de données pour répondre à une question.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import ApifyDatasetLoader
```

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

```python
query = "What is Apify?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 Apify is a platform for developing, running, and sharing serverless cloud programs. It enables users to create web scraping and automation tools and publish them on the Apify platform.

https://docs.apify.com/platform/actors, https://docs.apify.com/platform/actors/running/actors-in-store, https://docs.apify.com/platform/security, https://docs.apify.com/platform/actors/examples
```
