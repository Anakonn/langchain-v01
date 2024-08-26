---
sidebar_label: Bedrock
translated: true
---

# ChatBedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/)は、`AI21 Labs`、`Anthropic`、`Cohere`、`Meta`、`Stability AI`、`Amazon`などの
> 主要なAI企業から提供される高性能な基盤モデル(FM)を単一のAPIで選択できる完全マネージドサービスです。
> また、セキュリティ、プライバシー、責任あるAIを備えた、ジェネレーティブAIアプリケーションを構築するために必要な幅広い機能も提供しています。
> `Amazon Bedrock`を使うと、ユースケースに合わせてトップFMを簡単に試験・評価でき、
> ファインチューニングやRetrievalAugmentedGeneration(RAG)などの手法を使ってデータでプライベートにカスタマイズし、
> 企業のシステムやデータソースを使ってタスクを実行するエージェントを構築できます。
> `Amazon Bedrock`はサーバーレスなので、インフラの管理は不要で、
> 皆さんが既に使い慣れているAWSサービスを使ってジェネレーティブAI機能を安全に統合・展開できます。

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

### ストリーミング

レスポンスをストリーミングするには、実行可能な`.stream()`メソッドを使用できます。

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Voici la traduction en français :

J'aime la programmation.
```
