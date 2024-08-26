---
translated: true
---

# Bedrock (Bases de Conocimiento)

> [Knowledge bases for Amazon Bedrock](https://aws.amazon.com/bedrock/knowledge-bases/) es una oferta de Amazon Web Services (AWS) que le permite construir aplicaciones RAG rápidamente utilizando sus datos privados para personalizar la respuesta de FM.

> La implementación de `RAG` requiere que las organizaciones realicen varios pasos engorrosos para convertir los datos en incrustaciones (vectores), almacenar las incrustaciones en una base de datos de vectores especializada y construir integraciones personalizadas en la base de datos para buscar y recuperar el texto relevante para la consulta del usuario. Esto puede ser tedioso e ineficiente.

> Con `Knowledge Bases for Amazon Bedrock`, simplemente apunte a la ubicación de sus datos en `Amazon S3`, y `Knowledge Bases for Amazon Bedrock` se encarga de todo el flujo de trabajo de ingesta en su base de datos de vectores. Si no tiene una base de datos de vectores existente, Amazon Bedrock crea un almacén de vectores Amazon OpenSearch Serverless para usted. Para las recuperaciones, use la integración Langchain - Amazon Bedrock a través de la API de Recuperación para recuperar los resultados relevantes para una consulta de usuario de las bases de conocimiento.

> La base de conocimiento se puede configurar a través de [AWS Console](https://aws.amazon.com/console/) o utilizando [AWS SDKs](https://aws.amazon.com/developer/tools/).

## Uso del Recuperador de Bases de Conocimiento

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

### Uso en una Cadena de Preguntas y Respuestas

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
