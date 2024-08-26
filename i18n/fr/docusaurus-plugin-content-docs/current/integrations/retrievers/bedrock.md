---
translated: true
---

# Bedrock (Bases de connaissances)

> [Bases de connaissances pour Amazon Bedrock](https://aws.amazon.com/bedrock/knowledge-bases/) est une offre d'Amazon Web Services (AWS) qui vous permet de construire rapidement des applications RAG en utilisant vos données privées pour personnaliser la réponse FM.

> La mise en œuvre de `RAG` nécessite que les organisations effectuent plusieurs étapes fastidieuses pour convertir les données en embeddings (vecteurs), stocker les embeddings dans une base de données vectorielle spécialisée et construire des intégrations personnalisées dans la base de données pour rechercher et récupérer le texte pertinent pour la requête de l'utilisateur. Cela peut être long et inefficace.

> Avec `Bases de connaissances pour Amazon Bedrock`, il suffit de pointer vers l'emplacement de vos données dans `Amazon S3`, et `Bases de connaissances pour Amazon Bedrock` se charge de tout le workflow d'ingestion dans votre base de données vectorielle. Si vous n'avez pas de base de données vectorielle existante, Amazon Bedrock crée un magasin vectoriel Amazon OpenSearch Serverless pour vous. Pour les récupérations, utilisez l'intégration Langchain - Amazon Bedrock via l'API Retrieve pour récupérer les résultats pertinents pour une requête d'utilisateur à partir des bases de connaissances.

> La base de connaissances peut être configurée via [AWS Console](https://aws.amazon.com/console/) ou en utilisant les [AWS SDKs](https://aws.amazon.com/developer/tools/).

## Utilisation du récupérateur de bases de connaissances

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKnowledgeBasesRetriever

retriever = AmazonKnowledgeBasesRetriever(
    knowledge_base_id="PUIJP4EQUA",
    retrieval_config={"vectorSearchConfiguration": {"numberOfResults": 4}},
)
```

```python
query = "What did the president say about Ketanji Brown?"

retriever.invoke(query)
```

### Utilisation dans une chaîne QA

```python
from botocore.client import Config
from langchain.chains import RetrievalQA
from langchain_community.llms import Bedrock

model_kwargs_claude = {"temperature": 0, "top_k": 10, "max_tokens_to_sample": 3000}

llm = Bedrock(model_id="anthropic.claude-v2", model_kwargs=model_kwargs_claude)

qa = RetrievalQA.from_chain_type(
    llm=llm, retriever=retriever, return_source_documents=True
)

qa(query)
```
