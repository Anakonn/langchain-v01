---
translated: true
---

# ログ、トレース、モニタリング

Langchainを使ってアプリやエージェントを構築する際は、単一のユーザーリクエストを満たすために複数のAPIコールを行うことになります。しかし、これらのリクエストは分析したい場合にはチェーンされていません。[**Portkey**](/docs/integrations/providers/portkey/)を使えば、単一のユーザーリクエストからのすべての埋め込み、補完、その他のリクエストがログに記録され、トレースされ、共通のIDに関連付けられるため、ユーザーインタラクションの完全な可視化が可能になります。

このノートブックは、Langchain LLMコールをPortkeyを使ってログ記録、トレース、モニタリングする方法を段階的に説明するものです。

まず、Portkey、OpenAI、Agentツールをインポートしましょう。

```python
import os

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders
```

以下にOpenAI APIキーを貼り付けてください。[(ここで見つかります)](https://platform.openai.com/account/api-keys)

```python
os.environ["OPENAI_API_KEY"] = "..."
```

## Portkey APIキーの取得

1. [ここ](https://app.portkey.ai/signup)でPortkeyに登録する
2. [ダッシュボード](https://app.portkey.ai/)で、左下のプロフィルアイコンをクリックし、「APIキーのコピー」をクリックする
3. 以下に貼り付ける

```python
PORTKEY_API_KEY = "..."  # Paste your Portkey API Key here
```

## トレースIDの設定

1. 以下にリクエストのトレースIDを設定する
2. トレースIDは、単一のリクエストから発生するすべてのAPIコールで共通にする

```python
TRACE_ID = "uuid-trace-id"  # Set trace id here
```

## Portkey ヘッダーの生成

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY, provider="openai", trace_id=TRACE_ID
)
```

プロンプトとツールを定義する

```python
from langchain import hub
from langchain_core.tools import tool

prompt = hub.pull("hwchase17/openai-tools-agent")


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]
```

エージェントを通常どおり実行する。唯一の変更点は、上記のヘッダーをリクエストに含めることです。

```python
model = ChatOpenAI(
    base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0
)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[33;1m[1;3m243[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 36}`


[0m[36;1m[1;3m8748[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 8748, 'exponent': 2}`


[0m[33;1m[1;3m76527504[0m[32;1m[1;3mThe result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by thirty six, then square the result',
 'output': 'The result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.'}
```

## Portkeyでのログ記録とトレースの仕組み

**ログ記録**
- Portkeyを介してリクエストを送信すると、すべてのリクエストがデフォルトでログに記録される
- 各リクエストログには、`timestamp`、`model name`、`total cost`、`request time`、`request json`、`response json`、およびPortkeyの追加機能が含まれる

**[トレース](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/traces)**
- トレースIDは各リクエストと一緒に渡され、Portkeyダッシュボードのログに表示される
- 必要に応じて、各リクエストに**固有のトレースID**を設定することもできる
- トレースIDにユーザーフィードバックを追加することもできる。[詳細はこちら](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/feedback)

上記のリクエストについては、次のようにして全体のログトレースを表示できます。
![Portkey上でLangchainのトレースを表示](https://assets.portkey.ai/docs/agent_tracing.gif)

## 高度なLLMOps機能 - キャッシング、タグ付け、リトライ

ログ記録とトレースに加えて、Portkeyにはワークフローに本番環境の機能を追加する以下のような機能があります:

**キャッシング**

OpenAIに再度送信する代わりに、以前のユーザークエリをキャッシュから返す。完全一致または意味的に類似したものを照合できる。キャッシュにより、コストを節減し、レイテンシを20倍削減できる。[ドキュメント](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/cache-simple-and-semantic)

**リトライ**

失敗したAPIリクエストを最大**5回**自動的に再処理する。**指数バックオフ**戦略を使用し、ネットワークの過負荷を防ぐためにリトライ間隔を空ける。[ドキュメント](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations)

**タグ付け**

事前定義されたタグを使って、各ユーザーインタラクションを詳細に追跡およびオーディットする。[ドキュメント](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/metadata)
