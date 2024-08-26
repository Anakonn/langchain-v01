---
translated: true
---

# Recherche IA Azure

[Recherche IA Azure](https://learn.microsoft.com/azure/search/search-what-is-azure-search) (anciennement appelée `Azure Cognitive Search`) est un service de recherche cloud Microsoft qui fournit aux développeurs l'infrastructure, les API et les outils pour la recherche d'informations à grande échelle à l'aide de requêtes vectorielles, de mots-clés et hybrides.

`AzureAISearchRetriever` est un module d'intégration qui renvoie des documents à partir d'une requête non structurée. Il est basé sur la classe BaseRetriever et cible la version stable 2023-11-01 de l'API REST d'Azure AI Search, ce qui signifie qu'il prend en charge l'indexation et les requêtes vectorielles.

Pour utiliser ce module, vous avez besoin :

+ D'un service Azure AI Search. Vous pouvez en [créer un](https://learn.microsoft.com/azure/search/search-create-service-portal) gratuitement si vous vous inscrivez à l'essai Azure. Un service gratuit a des quotas plus faibles, mais il suffit pour exécuter le code de ce notebook.

+ D'un index existant avec des champs vectoriels. Il existe plusieurs façons de créer un index, notamment en utilisant le [module de stockage vectoriel](../vectorstores/azuresearch.md). Ou, [essayez les API REST d'Azure AI Search](https://learn.microsoft.com/azure/search/search-get-started-vector).

+ D'une clé d'API. Les clés d'API sont générées lors de la création du service de recherche. Si vous ne faites que requêter un index, vous pouvez utiliser la clé d'API de requête, sinon utilisez une clé d'API d'administrateur. Voir [Trouver vos clés d'API](https://learn.microsoft.com/azure/search/search-security-api-keys?tabs=rest-use%2Cportal-find%2Cportal-query#find-existing-keys) pour plus de détails.

`AzureAISearchRetriever` remplace `AzureCognitiveSearchRetriever`, qui sera bientôt déprécié. Nous vous recommandons de passer à la nouvelle version basée sur la version stable la plus récente des API de recherche.

## Installer les packages

Utilisez le package azure-documents-search version 11.4 ou ultérieure.

```python
%pip install --upgrade --quiet langchain
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet  azure-search-documents
%pip install --upgrade --quiet  azure-identity
```

## Importer les bibliothèques requises

```python
import os

from langchain_community.retrievers import (
    AzureAISearchRetriever,
)
```

## Configurer les paramètres de recherche

Définissez le nom du service de recherche, le nom de l'index et la clé d'API en tant que variables d'environnement (vous pouvez également les transmettre en tant qu'arguments à `AzureAISearchRetriever`). L'index de recherche fournit le contenu consultable.

```python
os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "<YOUR_SEARCH_INDEX_NAME>"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_API_KEY>"
```

## Créer le récupérateur

Pour `AzureAISearchRetriever`, fournissez un `index_name`, une `content_key` et un `top_k` défini sur le nombre de résultats que vous souhaitez récupérer. Définir `top_k` sur zéro (la valeur par défaut) renvoie tous les résultats.

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

Vous pouvez maintenant l'utiliser pour récupérer des documents à partir d'Azure AI Search.
C'est la méthode que vous appelleriez pour le faire. Elle renverra tous les documents pertinents pour la requête.

```python
retriever.invoke("here is my unstructured query string")
```

## Exemple

Cette section montre comment utiliser le récupérateur sur des données d'exemple intégrées. Vous pouvez ignorer cette étape si vous avez déjà un index vectoriel sur votre service de recherche.

Commencez par fournir les points de terminaison et les clés. Comme nous créons un index vectoriel dans cette étape, spécifiez un modèle d'intégration de texte pour obtenir une représentation vectorielle du texte. Cet exemple suppose Azure OpenAI avec un déploiement de text-embedding-ada-002. Comme cette étape crée un index, assurez-vous d'utiliser une clé d'API d'administrateur pour votre service de recherche.

```python
import os

from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import TokenTextSplitter
from langchain.vectorstores import AzureSearch
from langchain_community.retrievers import AzureAISearchRetriever
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "langchain-vector-demo"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_SEARCH_SERVICE_ADMIN_API_KEY>"
azure_endpoint: str = "<YOUR_AZURE_OPENAI_ENDPOINT>"
azure_openai_api_key: str = "<YOUR_AZURE_OPENAI_API_KEY>"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

Nous utiliserons un modèle d'intégration d'Azure OpenAI pour transformer nos documents en intégrations stockées dans le magasin vectoriel d'Azure AI Search. Nous définirons également le nom de l'index sur `langchain-vector-demo`. Cela créera un nouveau magasin vectoriel associé à ce nom d'index.

```python
embeddings = AzureOpenAIEmbeddings(
    model=azure_deployment,
    azure_endpoint=azure_endpoint,
    openai_api_key=azure_openai_api_key,
)

vector_store: AzureSearch = AzureSearch(
    embedding_function=embeddings.embed_query,
    azure_search_endpoint=os.getenv("AZURE_AI_SEARCH_SERVICE_NAME"),
    azure_search_key=os.getenv("AZURE_AI_SEARCH_API_KEY"),
    index_name="langchain-vector-demo",
)
```

Ensuite, nous chargerons les données dans notre nouveau magasin vectoriel créé. Pour cet exemple, nous chargeons le fichier `state_of_the_union.txt`. Nous diviserons le texte en tranches de 400 jetons sans chevauchement. Enfin, les documents sont ajoutés à notre magasin vectoriel sous forme d'intégrations.

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```

Ensuite, nous créerons un récupérateur. La variable `index_name` actuelle est `langchain-vector-demo` de l'étape précédente. Si vous avez sauté la création du magasin vectoriel, fournissez le nom de votre index dans le paramètre. Dans cette requête, le résultat le plus pertinent est renvoyé.

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

Maintenant, nous pouvons récupérer les données pertinentes à notre requête à partir des documents que nous avons chargés.

```python
retriever.invoke("does the president have a plan for covid-19?")
```
