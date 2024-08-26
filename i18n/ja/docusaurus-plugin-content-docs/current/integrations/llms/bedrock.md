---
translated: true
---

# ベッドロック

>[Amazon Bedrock](https://aws.amazon.com/bedrock/)は、`AI21 Labs`、`Anthropic`、`Cohere`、`Meta`、`Stability AI`、`Amazon`などの
> 主要なAI企業からの高性能な基盤モデル(FM)を単一のAPIで提供する完全管理型のサービスです。
> セキュリティ、プライバシー、責任あるAIに対応した幅広い機能を備えています。
> `Amazon Bedrock`を使えば、ユースケースに合わせてトップFMを簡単に試験・評価でき、
> ファインチューニングや`Retrieval Augmented Generation`(`RAG`)などの手法を使って
> 自社のデータで非公開にカスタマイズし、エンタープライズシステムやデータソースを活用して
> タスクを実行するエージェントを構築できます。
> `Amazon Bedrock`はサーバーレスなので、インフラの管理は不要で、
> 既に使い慣れているAWSサービスを使ってジェネレーティブAIの機能を
> アプリケーションに安全に統合・展開できます。

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin", model_id="amazon.titan-text-express-v1"
)
```

### 会話チェーンでの使用

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### ストリーミング付き会話チェーン

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

### カスタムモデル

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

### Amazon Bedrock のガードレールの例

## Amazon Bedrock (プレビュー)のガードレール

[Amazon Bedrock のガードレール](https://aws.amazon.com/bedrock/guardrails/)は、ユースケース固有のポリシーに基づいて
ユーザー入力とモデル応答を評価し、基盤となるモデルに関係なく
追加の保護レイヤーを提供します。ガードレールは、Anthropic Claude、
Meta Llama 2、Cohere Command、AI21 Labs Jurassic、Amazon Titan Textなど、
ファインチューニングされたモデルにも適用できます。
**注意**: Amazon Bedrock のガードレールは現在プレビュー中で、一般提供されていません。
この機能へのアクセスをご希望の場合は、通常のAWSサポート窓口までお問い合わせください。
このセクションでは、トレーシング機能を含む特定のガードレールを設定した
Bedrock言語モデルを設定します。

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
