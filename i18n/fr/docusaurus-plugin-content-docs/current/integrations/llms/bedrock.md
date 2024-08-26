---
translated: true
---

# Bedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) est un service entièrement géré qui offre un choix de modèles de base (FMs) à hautes performances provenant de sociétés d'IA de premier plan comme `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI` et `Amazon` via une seule API, ainsi qu'un large éventail de capacités dont vous avez besoin pour construire des applications d'IA générative avec sécurité, confidentialité et IA responsable. En utilisant `Amazon Bedrock`, vous pouvez facilement expérimenter et évaluer les principaux FMs pour votre cas d'utilisation, les personnaliser de manière privée avec vos données en utilisant des techniques telles que le fine-tuning et la `Retrieval Augmented Generation` (`RAG`), et construire des agents qui exécutent des tâches en utilisant vos systèmes d'entreprise et vos sources de données. Étant donné que `Amazon Bedrock` est serverless, vous n'avez pas à gérer d'infrastructure, et vous pouvez intégrer et déployer de manière sécurisée des capacités d'IA générative dans vos applications en utilisant les services AWS que vous connaissez déjà.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin", model_id="amazon.titan-text-express-v1"
)
```

### Utilisation dans une chaîne de conversation

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### Chaîne de conversation avec diffusion en continu

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="amazon.titan-text-express-v1",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
```

```python
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### Modèles personnalisés

```python
custom_llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    provider="cohere",
    model_id="<Custom model ARN>",  # ARN like 'arn:aws:bedrock:...' obtained via provisioning the custom model
    model_kwargs={"temperature": 1},
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

conversation = ConversationChain(
    llm=custom_llm, verbose=True, memory=ConversationBufferMemory()
)
conversation.predict(input="What is the recipe of mayonnaise?")
```

### Exemple de garde-fous pour Amazon Bedrock

## Garde-fous pour Amazon Bedrock (Aperçu)

[Garde-fous pour Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) évalue les entrées des utilisateurs et les réponses des modèles en fonction de politiques spécifiques au cas d'utilisation, et fournit une couche de sécurité supplémentaire indépendamment du modèle sous-jacent. Les garde-fous peuvent être appliqués à travers les modèles, y compris Anthropic Claude, Meta Llama 2, Cohere Command, AI21 Labs Jurassic et Amazon Titan Text, ainsi que les modèles affinés.
**Remarque** : Les garde-fous pour Amazon Bedrock sont actuellement en prévisualisation et ne sont pas généralement disponibles. Contactez vos interlocuteurs habituels du support AWS si vous souhaitez accéder à cette fonctionnalité.
Dans cette section, nous allons configurer un modèle de langage Bedrock avec des garde-fous spécifiques incluant des capacités de traçage.

```python
from typing import Any

from langchain_core.callbacks import AsyncCallbackHandler


class BedrockAsyncCallbackHandler(AsyncCallbackHandler):
    # Async callback handler that can be used to handle callbacks from langchain.

    async def on_llm_error(self, error: BaseException, **kwargs: Any) -> Any:
        reason = kwargs.get("reason")
        if reason == "GUARDRAIL_INTERVENED":
            print(f"Guardrails: {kwargs}")


# Guardrails for Amazon Bedrock with trace
llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="<Model_ID>",
    model_kwargs={},
    guardrails={"id": "<Guardrail_ID>", "version": "<Version>", "trace": True},
    callbacks=[BedrockAsyncCallbackHandler()],
)
```
