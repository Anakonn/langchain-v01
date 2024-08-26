---
translated: true
---

# Bedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) est un service entièrement géré qui offre un choix de modèles de base (FMs) à hautes performances provenant de sociétés d'IA de premier plan comme `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI` et `Amazon` via une seule API, ainsi qu'un large éventail de capacités dont vous avez besoin pour construire des applications d'IA générative avec sécurité, confidentialité et IA responsable. En utilisant `Amazon Bedrock`, vous pouvez facilement expérimenter et évaluer les principaux FMs pour votre cas d'utilisation, les personnaliser de manière privée avec vos données en utilisant des techniques telles que le fine-tuning et la `Retrieval Augmented Generation` (`RAG`), et construire des agents qui exécutent des tâches en utilisant vos systèmes d'entreprise et vos sources de données. Étant donné que `Amazon Bedrock` est sans serveur, vous n'avez pas à gérer d'infrastructure, et vous pouvez intégrer et déployer de manière sécurisée des capacités d'IA générative dans vos applications en utilisant les services AWS que vous connaissez déjà.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings(
    credentials_profile_name="bedrock-admin", region_name="us-east-1"
)
```

```python
embeddings.embed_query("This is a content of the document")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("This is a content of the document")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
