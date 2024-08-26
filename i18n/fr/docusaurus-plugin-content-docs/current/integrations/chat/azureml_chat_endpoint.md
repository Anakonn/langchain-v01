---
sidebar_label: Azure ML Endpoint
translated: true
---

# AzureMLChatOnlineEndpoint

>[Azure Machine Learning](https://azure.microsoft.com/en-us/products/machine-learning/) est une plateforme utilisée pour construire, entraîner et déployer des modèles d'apprentissage automatique. Les utilisateurs peuvent explorer les types de modèles à déployer dans le catalogue de modèles, qui fournit des modèles fondamentaux et à usage général de différents fournisseurs.
>
>En général, vous devez déployer des modèles afin de consommer leurs prédictions (inférence). Dans `Azure Machine Learning`, les [points de terminaison en ligne](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints) sont utilisés pour déployer ces modèles avec un service en temps réel. Ils sont basés sur les concepts de `points de terminaison` et de `déploiements` qui vous permettent de découpler l'interface de votre charge de travail de production de la mise en œuvre qui la dessert.

Ce notebook explique comment utiliser un modèle de chat hébergé sur un `point de terminaison Azure Machine Learning`.

```python
from langchain_community.chat_models.azureml_endpoint import AzureMLChatOnlineEndpoint
```

## Configuration

Vous devez [déployer un modèle sur Azure ML](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing) ou [sur Azure AI Studio](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open) et obtenir les paramètres suivants :

* `endpoint_url` : L'URL du point de terminaison REST fournie par le point de terminaison.
* `endpoint_api_type` : Utilisez `endpoint_type='dedicated'` lors du déploiement de modèles sur des **points de terminaison dédiés** (infrastructure gérée hébergée). Utilisez `endpoint_type='serverless'` lors du déploiement de modèles à l'aide de l'offre **Pay-as-you-go** (modèle en tant que service).
* `endpoint_api_key` : La clé API fournie par le point de terminaison

## Formateur de contenu

Le paramètre `content_formatter` est une classe de gestionnaire pour transformer la requête et la réponse d'un point de terminaison AzureML afin qu'elles correspondent au schéma requis. Étant donné qu'il existe une grande variété de modèles dans le catalogue de modèles, dont chacun peut traiter les données différemment les uns des autres, une classe `ContentFormatterBase` est fournie pour permettre aux utilisateurs de transformer les données à leur guise. Les formateurs de contenu suivants sont fournis :

* `CustomOpenAIChatContentFormatter` : Formate les données de requête et de réponse pour les modèles comme LLaMa2-chat qui suivent les spécifications de l'API OpenAI pour les requêtes et les réponses.

*Remarque : `langchain.chat_models.azureml_endpoint.LlamaChatContentFormatter` est en cours de dépréciation et est remplacé par `langchain.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter`.*

Vous pouvez implémenter des formateurs de contenu personnalisés spécifiques à votre modèle en dérivant de la classe `langchain_community.llms.azureml_endpoint.ContentFormatterBase`.

## Exemples

La section suivante contient des exemples sur la façon d'utiliser cette classe :

### Exemple : Complétion de chat avec des points de terminaison en temps réel

```python
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIChatContentFormatter,
)
from langchain_core.messages import HumanMessage

chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter(),
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

```output
AIMessage(content='  The Collatz Conjecture is one of the most famous unsolved problems in mathematics, and it has been the subject of much study and research for many years. While it is impossible to predict with certainty whether the conjecture will ever be solved, there are several reasons why it is considered a challenging and important problem:\n\n1. Simple yet elusive: The Collatz Conjecture is a deceptively simple statement that has proven to be extraordinarily difficult to prove or disprove. Despite its simplicity, the conjecture has eluded some of the brightest minds in mathematics, and it remains one of the most famous open problems in the field.\n2. Wide-ranging implications: The Collatz Conjecture has far-reaching implications for many areas of mathematics, including number theory, algebra, and analysis. A solution to the conjecture could have significant impacts on these fields and potentially lead to new insights and discoveries.\n3. Computational evidence: While the conjecture remains unproven, extensive computational evidence supports its validity. In fact, no counterexample to the conjecture has been found for any starting value up to 2^64 (a number', additional_kwargs={}, example=False)
```

### Exemple : Complétion de chat avec des déploiements Pay-as-you-go (modèle en tant que service)

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

Si vous devez passer des paramètres supplémentaires au modèle, utilisez l'argument `model_kwargs` :

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
    model_kwargs={"temperature": 0.8},
)
```

Les paramètres peuvent également être passés lors de l'invocation :

```python
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")],
    max_tokens=512,
)
response
```
