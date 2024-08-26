---
translated: true
---

# Bedrock (ナレッジベース)

> [Amazon Bedrock のナレッジベース](https://aws.amazon.com/bedrock/knowledge-bases/)は、Amazon Web Services (AWS) のサービスで、プライベートデータを使用してFMレスポンスをカスタマイズすることで、RAGアプリケーションを迅速に構築できます。

> `RAG`を実装するには、組織は、データをエンベディング(ベクトル)に変換し、特殊なベクトルデータベースに保存し、データベースへの検索と関連テキストの取得をカスタムで統合する面倒な手順を実行する必要があります。これは時間がかかり非効率的です。

> `Amazon Bedrock のナレッジベース`では、データの場所を`Amazon S3`に指定するだけで、`Amazon Bedrock のナレッジベース`がデータのインジェストワークフロー全体をベクトルデータベースに処理します。既存のベクトルデータベースがない場合は、Amazon Bedrock がAmazon OpenSearch Serverlessのベクトルストアを作成します。検索には、Langchain - Amazon Bedrock統合のRetrieve APIを使用して、ユーザークエリに関連する結果をナレッジベースから取得できます。

> ナレッジベースは、[AWS Console](https://aws.amazon.com/console/)または[AWS SDKs](https://aws.amazon.com/developer/tools/)を使用して設定できます。

## ナレッジベースのリトリーバーの使用

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

### QAチェーンでの使用

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
