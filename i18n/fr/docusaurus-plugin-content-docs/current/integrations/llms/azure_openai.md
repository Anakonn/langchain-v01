---
translated: true
---

# Azure OpenAI

Ce cahier d'exercices explique comment utiliser Langchain avec [Azure OpenAI](https://aka.ms/azure-openai).

L'API Azure OpenAI est compatible avec l'API OpenAI. Le package Python `openai` facilite l'utilisation d'OpenAI et d'Azure OpenAI. Vous pouvez appeler Azure OpenAI de la même manière que vous appelez OpenAI, avec les exceptions notées ci-dessous.

## Configuration de l'API

Vous pouvez configurer le package `openai` pour utiliser Azure OpenAI à l'aide de variables d'environnement. Voici un exemple pour `bash` :

```bash
# The API version you want to use: set this to `2023-12-01-preview` for the released version.
export OPENAI_API_VERSION=2023-12-01-preview
# The base URL for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
# The API key for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_API_KEY=<your Azure OpenAI API key>
```

Alternativement, vous pouvez configurer l'API directement dans votre environnement Python en cours d'exécution :

```python
import os
os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
```

## Authentification Azure Active Directory

Il existe deux façons de s'authentifier à Azure OpenAI :
- Clé d'API
- Azure Active Directory (AAD)

L'utilisation de la clé d'API est le moyen le plus simple pour commencer. Vous pouvez trouver votre clé d'API dans le portail Azure, sous votre ressource Azure OpenAI.

Cependant, si vous avez des exigences de sécurité complexes, vous pouvez utiliser Azure Active Directory. Vous pouvez trouver plus d'informations sur l'utilisation d'AAD avec Azure OpenAI [ici](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity).

Si vous développez localement, vous devrez avoir l'Azure CLI installé et être connecté. Vous pouvez installer l'Azure CLI [ici](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli). Ensuite, exécutez `az login` pour vous connecter.

Ajoutez une attribution de rôle Azure `Cognitive Services OpenAI User` étendue à votre ressource Azure OpenAI. Cela vous permettra d'obtenir un jeton d'AAD à utiliser avec Azure OpenAI. Vous pouvez accorder cette attribution de rôle à un utilisateur, un groupe, un principal de service ou une identité gérée. Pour plus d'informations sur les rôles RBAC d'Azure OpenAI, voir [ici](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control).

Pour utiliser AAD dans Python avec LangChain, installez le package `azure-identity`. Ensuite, définissez `OPENAI_API_TYPE` sur `azure_ad`. Utilisez ensuite la classe `DefaultAzureCredential` pour obtenir un jeton d'AAD en appelant `get_token` comme indiqué ci-dessous. Enfin, définissez la variable d'environnement `OPENAI_API_KEY` avec la valeur du jeton.

```python
import os
from azure.identity import DefaultAzureCredential

# Get the Azure Credential
credential = DefaultAzureCredential()

# Set the API type to `azure_ad`
os.environ["OPENAI_API_TYPE"] = "azure_ad"
# Set the API_KEY to the token from the Azure credential
os.environ["OPENAI_API_KEY"] = credential.get_token("https://cognitiveservices.azure.com/.default").token
```

La classe `DefaultAzureCredential` est un moyen simple de commencer avec l'authentification AAD. Vous pouvez également personnaliser la chaîne d'identification si nécessaire. Dans l'exemple ci-dessous, nous essayons d'abord l'identité gérée, puis nous revenons à l'Azure CLI. Cela est utile si vous exécutez votre code dans Azure, mais que vous voulez développer localement.

```python
from azure.identity import ChainedTokenCredential, ManagedIdentityCredential, AzureCliCredential

credential = ChainedTokenCredential(
    ManagedIdentityCredential(),
    AzureCliCredential()
)
```

## Déploiements

Avec Azure OpenAI, vous configurez vos propres déploiements des modèles GPT-3 et Codex courants. Lors de l'appel de l'API, vous devez spécifier le déploiement que vous souhaitez utiliser.

_**Remarque** : Ces documents concernent les modèles de complétion de texte Azure. Les modèles comme GPT-4 sont des modèles de chat. Ils ont une interface légèrement différente et peuvent être accessibles via la classe `AzureChatOpenAI`. Pour la documentation sur Azure Chat, voir [la documentation Azure Chat OpenAI](/docs/integrations/chat/azure_chat_openai)._

Supposons que le nom de votre déploiement soit `gpt-35-turbo-instruct-prod`. Dans l'API Python `openai`, vous pouvez spécifier ce déploiement avec le paramètre `engine`. Par exemple :

```python
import openai

client = AzureOpenAI(
    api_version="2023-12-01-preview",
)

response = client.completions.create(
    model="gpt-35-turbo-instruct-prod",
    prompt="Test prompt"
)
```

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import os

os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
os.environ["AZURE_OPENAI_API_KEY"] = "..."
```

```python
# Import Azure OpenAI
from langchain_openai import AzureOpenAI
```

```python
# Create an instance of Azure OpenAI
# Replace the deployment name with your own
llm = AzureOpenAI(
    deployment_name="gpt-35-turbo-instruct-0914",
)
```

```python
# Run the LLM
llm.invoke("Tell me a joke")
```

```output
" Why couldn't the bicycle stand up by itself?\n\nBecause it was two-tired!"
```

Nous pouvons également imprimer le LLM et voir son impression personnalisée.

```python
print(llm)
```

```output
[1mAzureOpenAI[0m
Params: {'deployment_name': 'gpt-35-turbo-instruct-0914', 'model_name': 'gpt-3.5-turbo-instruct', 'temperature': 0.7, 'top_p': 1, 'frequency_penalty': 0, 'presence_penalty': 0, 'n': 1, 'logit_bias': {}, 'max_tokens': 256}
```
