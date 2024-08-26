---
translated: true
---

# ポートキー

[ポートキー](https://portkey.ai)は、AIアプリのコントロールパネルです。人気のAIゲートウェイとObservabilityスイートを備えており、数多くのチームが**信頼性**、**コスト効率**、**高速**なアプリを提供しています。

## LLMOps for Langchain

ポートキーは、Langchainに本番環境の準備を提供します。ポートキーを使うと、以下のことができます:
- [x] 統一されたAPIを通じて150以上のモデルに接続する
- [x] すべてのリクエストの42以上の**メトリクスとログ**を表示する
- [x] **セマンティックキャッシュ**を有効にして、レイテンシーとコストを削減する
- [x] 失敗したリクエストの**自動リトライ&フォールバック**を実装する
- [x] リクエストに**カスタムタグ**を追加して、より良いトラッキングと分析を行う、[その他](https://portkey.ai/docs)

## クイックスタート - ポートキー & Langchain

ポートキーはOpenAIシグネチャーと完全に互換性があるため、`ChatOpenAI`インターフェースを通じてポートキーAIゲートウェイに接続できます。

- `base_url`を`PORTKEY_GATEWAY_URL`に設定する
- `createHeaders`ヘルパーメソッドを使って、ポートキーが必要とするヘッダーを含む`default_headers`を追加する

始めるには、[こちらから](https://app.portkey.ai/signup)ポートキーのAPIキーを取得してください。(左下のプロフィルアイコンをクリックし、「APIキーをコピー」をクリックしてください)または、[自分の環境](https://github.com/Portkey-AI/gateway/blob/main/docs/installation-deployments.md)でオープンソースのAIゲートウェイをデプロイすることもできます。

次に、ポートキーSDKをインストールします。

```python
pip install -U portkey_ai
```

Langchainの`ChatOpenAI`モデルを更新することで、ポートキーAIゲートウェイに接続できます。

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..." # Not needed when hosting your own gateway
PROVIDER_API_KEY = "..." # Add the API key of the AI provider being used

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,provider="openai")

llm = ChatOpenAI(api_key=PROVIDER_API_KEY, base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

リクエストは、指定された`provider`を通じてポートキーAIゲートウェイにルーティングされます。ポートキーはすべてのリクエストをログに記録するため、デバッグが非常に簡単になります。

![Langchainのログをポートキーから表示](https://assets.portkey.ai/docs/langchain-logs.gif)

## 150以上のモデルをAIゲートウェイから使用する

AIゲートウェイの力は、上記のコードスニペットを使って20以上のプロバイダーがサポートする150以上のモデルに接続できることにあります。

Anthropicの`claude-3-opus-20240229`モデルを呼び出すようにコードを変更してみましょう。

ポートキーは**[Virtual Keys](https://docs.portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/virtual-keys)**をサポートしており、これは安全なボールトでAPIキーを保存および管理する簡単な方法です。ポートキーのVirtual Keysタブに移動して、Anthropicの新しいキーを作成してみましょう。

`virtual_key`パラメーターは、使用するAIプロバイダーの認証とプロバイダーを設定します。この場合、Anthropicの仮想キーを使用しています。

> `api_key`は空のままでも構いません。その認証は使用されません。

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..."
VIRTUAL_KEY = "..." # Anthropic's virtual key we copied above

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,virtual_key=VIRTUAL_KEY)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, model="claude-3-opus-20240229")

llm.invoke("What is the meaning of life, universe and everything?")
```

ポートキーAIゲートウェイが Anthropic への API リクエストを認証し、OpenAI 形式の応答を取得して返します。

AIゲートウェイは Langchain の `ChatOpenAI` クラスを拡張しているため、任意のプロバイダーおよびモデルを呼び出すための単一のインターフェースになります。

## 高度なルーティング - ロードバランシング、フォールバック、リトライ

ポートキーAIゲートウェイは、設定ファーストのアプローチを通じて、ロードバランシング、フォールバック、実験、カナリアテストなどの機能をLangchainにもたらします。

`gpt-4`と`claude-opus`の2つの大規模モデルの間でトラフィックを50:50で分割してテストしたい**例**を見てみましょう。このゲートウェイ設定は次のようになります。

```python
config = {
    "strategy": {
         "mode": "loadbalance"
    },
    "targets": [{
        "virtual_key": "openai-25654", # OpenAI's virtual key
        "override_params": {"model": "gpt4"},
        "weight": 0.5
    }, {
        "virtual_key": "anthropic-25654", # Anthropic's virtual key
        "override_params": {"model": "claude-3-opus-20240229"},
        "weight": 0.5
    }]
}
```

この設定をLangchainからの要求に使用することができます。

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    config=config
)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

LLMが呼び出されると、ポートキーは定義された重みに従って`gpt-4`と`claude-3-opus-20240229`へのリクエストを分散します。

その他の設定例は[こちら](https://docs.portkey.ai/docs/api-reference/config-object#examples)にあります。

## **チェーンとエージェントのトレース**

ポートキーのLangchain統合により、エージェントの実行に完全な可視性が得られます。[人気のあるエージェントワークフロー](https://python.langchain.com/docs/use_cases/tool_use/quickstart/#agents)の例を見てみましょう。

`ChatOpenAI`クラスを上記のようにAIゲートウェイを使うように変更するだけです。

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Portkey"}, {"imported": "create_openai_tools_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.openai_tools.base.create_openai_tools_agent.html", "title": "Portkey"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "Portkey"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders

prompt = hub.pull("hwchase17/openai-tools-agent")

portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    virtual_key=OPENAI_VIRTUAL_KEY,
    trace_id="uuid-uuid-uuid-uuid"
)

@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]

model = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke({
    "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
})
```

**ポートキーダッシュボードでは、リクエストのログとトレースIDを確認できます:**
![Langchainエージェントログをポートキーで表示](https://assets.portkey.ai/docs/agent_tracing.gif)

追加のドキュメントは以下で入手できます:
- Observability - https://portkey.ai/docs/product/observability-modern-monitoring-for-llms
- AIゲートウェイ - https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations
- プロンプトライブラリ - https://portkey.ai/docs/product/prompt-library

人気のオープンソースAIゲートウェイは[こちら](https://github.com/portkey-ai/gateway)からチェックできます。

各機能の詳細な情報と使用方法については、[ポートキーのドキュメントを参照](https://portkey.ai/docs)してください。質問がある場合や、さらにサポートが必要な場合は、[Twitterで連絡](https://twitter.com/portkeyai)するか、[サポートメール](mailto:hello@portkey.ai)にご連絡ください。
