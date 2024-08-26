---
sidebar_label: Bedrock
translated: true
---

# ChatBedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) est un service entièrement géré qui offre un choix de modèles de base (FMs) à hautes performances provenant de sociétés d'IA de premier plan comme `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI` et `Amazon` via une seule API, ainsi qu'un large éventail de capacités dont vous avez besoin pour construire des applications d'IA générative avec sécurité, confidentialité et IA responsable. En utilisant `Amazon Bedrock`, vous pouvez facilement expérimenter et évaluer les principaux FMs pour votre cas d'utilisation, les personnaliser de manière privée avec vos données en utilisant des techniques telles que le fine-tuning et la `Retrieval Augmented Generation` (`RAG`), et construire des agents qui exécutent des tâches en utilisant vos systèmes d'entreprise et vos sources de données. Étant donné que `Amazon Bedrock` est serverless, vous n'avez pas à gérer d'infrastructure, et vous pouvez intégrer et déployer de manière sécurisée des capacités d'IA générative dans vos applications en utilisant les services AWS que vous connaissez déjà.

```python
%pip install --upgrade --quiet  langchain-aws
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage
```

```python
chat = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0.1},
)
```

```python
messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

```output
AIMessage(content="Voici la traduction en français :\n\nJ'aime la programmation.", additional_kwargs={'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, response_metadata={'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0', 'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, id='run-994f0362-0e50-4524-afad-3c4f5bb11328-0')
```

### Streaming

Pour diffuser les réponses, vous pouvez utiliser la méthode exécutable `.stream()`.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Voici la traduction en français :

J'aime la programmation.
```
