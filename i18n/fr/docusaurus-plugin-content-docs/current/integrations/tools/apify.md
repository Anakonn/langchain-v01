---
translated: true
---

# Apify

Ce notebook montre comment utiliser l'[intégration Apify](/docs/integrations/providers/apify) pour LangChain.

[Apify](https://apify.com) est une plateforme cloud pour le web scraping et l'extraction de données, qui fournit un [écosystème](https://apify.com/store) de plus d'un millier d'applications prêtes à l'emploi appelées *Actors* pour diverses utilisations de web scraping, de crawling et d'extraction de données. Par exemple, vous pouvez l'utiliser pour extraire les résultats de recherche Google, les profils Instagram et Facebook, les produits d'Amazon ou de Shopify, les avis Google Maps, etc.

Dans cet exemple, nous utiliserons l'Actor [Website Content Crawler](https://apify.com/apify/website-content-crawler), qui peut crawler en profondeur des sites Web tels que la documentation, les bases de connaissances, les centres d'aide ou les blogs, et extraire le contenu textuel des pages Web. Ensuite, nous alimentons l'index vectoriel avec les documents et répondons aux questions à partir de celui-ci.

```python
%pip install --upgrade --quiet  apify-client langchain-openai langchain
```

Tout d'abord, importez `ApifyWrapper` dans votre code source :

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.utilities import ApifyWrapper
from langchain_core.documents import Document
```

Initialisez-le en utilisant votre [jeton API Apify](https://console.apify.com/account/integrations) et, dans le cadre de cet exemple, également avec votre clé API OpenAI :

```python
import os

os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
os.environ["APIFY_API_TOKEN"] = "Your Apify API token"

apify = ApifyWrapper()
```

Ensuite, exécutez l'Actor, attendez qu'il soit terminé et récupérez ses résultats depuis le jeu de données Apify dans un chargeur de documents LangChain.

Notez que si vous avez déjà des résultats dans un jeu de données Apify, vous pouvez les charger directement en utilisant `ApifyDatasetLoader`, comme indiqué dans [ce notebook](/docs/integrations/document_loaders/apify_dataset). Dans ce notebook, vous trouverez également l'explication de la `dataset_mapping_function`, qui est utilisée pour mapper les champs des enregistrements du jeu de données Apify aux champs `Document` de LangChain.

```python
loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={"startUrls": [{"url": "https://python.langchain.com/en/latest/"}]},
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

Initialisez l'index vectoriel à partir des documents crawlés :

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

Et enfin, interrogez l'index vectoriel :

```python
query = "What is LangChain?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 LangChain is a standard interface through which you can interact with a variety of large language models (LLMs). It provides modules that can be used to build language model applications, and it also provides chains and agents with memory capabilities.

https://python.langchain.com/en/latest/modules/models/llms.html, https://python.langchain.com/en/latest/getting_started/getting_started.html
```
