---
translated: true
---

# Bedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/)は、`AI21 Labs`、`Anthropic`、`Cohere`、`Meta`、`Stability AI`、`Amazon`などの
> 主要なAI企業から提供される高性能な基盤モデル(FM)を単一のAPIから選択できる完全管理型のサービスです。
> セキュリティ、プライバシー、責任あるAIに対応した幅広い機能を備えており、
> 生成型AIアプリケーションの構築に役立ちます。`Amazon Bedrock`を使えば、
> ユースケースに合わせてトップFMを簡単に試験・評価でき、
> ファインチューニングや`Retrieval Augmented Generation`(`RAG`)などの手法を使って
> 自社のデータで非公開にカスタマイズできます。また、エンタープライズシステムやデータソースを
> 活用してタスクを実行するエージェントを構築することもできます。
> `Amazon Bedrock`はサーバーレスなので、インフラの管理は不要で、
> 既に使い慣れているAWSサービスを使って生成型AI機能を安全に統合・展開できます。

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
