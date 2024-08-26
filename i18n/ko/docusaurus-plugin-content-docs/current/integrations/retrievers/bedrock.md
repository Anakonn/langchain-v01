---
translated: true
---

# 베드록 (지식 베이스)

> [Amazon Bedrock 지식 베이스](https://aws.amazon.com/bedrock/knowledge-bases/)는 Amazon Web Services (AWS)가 제공하는 서비스로, 사용자의 개인 데이터를 사용하여 FM 응답을 사용자 정의할 수 있는 RAG 애플리케이션을 빠르게 구축할 수 있습니다.

> `RAG`를 구현하려면 조직에서 데이터를 임베딩(벡터)으로 변환하고, 특수 벡터 데이터베이스에 임베딩을 저장하며, 사용자 쿼리에 관련된 텍스트를 검색하고 검색하기 위한 사용자 정의 통합을 구축해야 합니다. 이는 시간이 많이 소요되고 비효율적일 수 있습니다.

> `Amazon Bedrock 지식 베이스`를 사용하면 데이터가 저장된 `Amazon S3` 위치를 지정하기만 하면 전체 수집 워크플로우가 벡터 데이터베이스로 처리됩니다. 기존 벡터 데이터베이스가 없는 경우 Amazon Bedrock이 Amazon OpenSearch Serverless 벡터 저장소를 생성합니다. 검색의 경우 Langchain - Amazon Bedrock 통합을 통해 Retrieve API를 사용하여 사용자 쿼리에 대한 관련 결과를 지식 베이스에서 검색할 수 있습니다.

> 지식 베이스는 [AWS Console](https://aws.amazon.com/console/) 또는 [AWS SDK](https://aws.amazon.com/developer/tools/)를 사용하여 구성할 수 있습니다.

## 지식 베이스 검색기 사용하기

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

### QA 체인에서 사용하기

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
