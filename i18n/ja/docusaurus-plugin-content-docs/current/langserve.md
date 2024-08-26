---
fixed: true
translated: true
---

# 🦜️🏓 LangServe

[![Release Notes](https://img.shields.io/github/release/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/releases)
[![Downloads](https://static.pepy.tech/badge/langserve/month)](https://pepy.tech/project/langserve)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)

🚩 LangChainアプリケーションのワンクリックデプロイメントのためのホストバージョンのLangServeをリリースします。[ここでサインアップ](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm)
してウェイトリストに登録してください。

## 概要

[LangServe](https://github.com/langchain-ai/langserve)は、開発者が`LangChain` [runnables and chains](https://python.langchain.com/docs/expression_language/)
をREST APIとしてデプロイするのを支援します。

このライブラリは[FastAPI](https://fastapi.tiangolo.com/)と統合されており、
データ検証には[pydantic](https://docs.pydantic.dev/latest/)を使用しています。

さらに、サーバーにデプロイされたrunnableを呼び出すためのクライアントも提供しています。
JavaScriptクライアントは[LangChain.js](https://js.langchain.com/docs/ecosystem/langserve)で利用可能です。

## 特徴

- LangChainオブジェクトから自動的に推論される入力および出力スキーマが、リッチなエラーメッセージとともにすべてのAPI呼び出しで強制されます
- JSONSchemaおよびSwaggerを備えたAPIドキュメントページ（例のリンクを挿入）
- 単一サーバーで多くの同時リクエストをサポートする効率的な`/invoke`、`/batch`、`/stream`エンドポイント
- チェーン/エージェントからのすべて（または一部）の中間ステップをストリーミングするための`/stream_log`エンドポイント
- **新機能** 0.0.40以降、`/stream_events`をサポートしており、`/stream_log`の出力を解析することなくストリーミングを容易にします。
- ストリーミング出力と中間ステップを備えた`/playground/`のプレイグラウンドページ
- APIキーを追加するだけで[LangSmith](https://www.langchain.com/langsmith)への組み込み（オプション）トレース（[説明書](https://docs.smith.langchain.com/))参照）
- FastAPI、Pydantic、uvloop、asyncioなどの実績のあるオープンソースPythonライブラリで構築
- クライアントSDKを使用してLangServeサーバーをローカルで実行されているRunnableのように呼び出す（またはHTTP APIを直接呼び出す）
- [LangServe Hub](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)

## 制限事項

- サーバーで発生するイベントのクライアントコールバックはまだサポートされていません
- Pydantic V2を使用する場合、OpenAPIドキュメントは生成されません。FastAPIは[pydantic v1とv2のネームスペースを混在させること](https://github.com/tiangolo/fastapi/issues/10360)をサポートしていません。
  詳細は以下のセクションを参照してください。

## ホストされたLangServe

LangChainアプリケーションのワンクリックデプロイメントのためのホストバージョンのLangServeをリリースします。[ここでサインアップ](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm)
してウェイトリストに登録してください。

## セキュリティ

- バージョン0.0.13 - 0.0.15の脆弱性 -- プレイグラウンドエンドポイントがサーバー上の任意のファイルにアクセスすることを許可します。[0.0.16で解決](https://github.com/langchain-ai/langserve/pull/98)。

## インストール

クライアントとサーバーの両方の場合：

```bash
pip install "langserve[all]"
```

またはクライアントコード用に`pip install "langserve[client]"`、
サーバーコード用に`pip install "langserve[server]"`。

## LangChain CLI 🛠️

`LangChain` CLIを使用して`LangServe`プロジェクトを迅速にブートストラップします。

langchain CLIを使用するには、最新バージョンの`langchain-cli`がインストールされていることを確認してください。`pip install -U langchain-cli`でインストールできます。

## セットアップ

**注意**: 依存関係管理には`poetry`を使用しています。poetryの[ドキュメント](https://python-poetry.org/docs/)を参照して詳細を学んでください。

### 1. langchain CLIコマンドを使用して新しいアプリを作成

```sh
langchain app new my-app
```

### 2. add_routesでrunnableを定義。server.pyに移動して編集

```sh
add_routes(app. NotImplemented)
```

### 3. `poetry`を使用してサードパーティパッケージ（例：langchain-openai、langchain-anthropic、langchain-mistralなど）を追加

```sh
poetry add [package-name] // e.g `poetry add langchain-openai`
```

### 4. 関連する環境変数を設定。例えば、

```sh
export OPENAI_API_KEY="sk-..."
```

### 5. アプリを提供

```sh
poetry run langchain serve --port=8100
```

## 例

[LangChainテンプレート](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)を使用してLangServeインスタンスを迅速に開始します。

詳細な例については、テンプレート[index](https://github.com/langchain-ai/langchain/blob/master/templates/docs/INDEX.md)または[例](https://github.com/langchain-ai/langserve/tree/main/examples)ディレクトリを参照してください。

| 説明                                                                                                                                                                                                                                                        | リンク                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLMs** OpenAIおよびAnthropicチャットモデルを予約する最小限の例。非同期を使用し、バッチ処理およびストリーミングをサポート。                                                                                                                                              | [server](https://github.com/langchain-ai/langserve/tree/main/examples/llm/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/llm/client.ipynb)                                                       |
| **Retriever** runnableとしてリトリーバーを公開するシンプルなサーバー。                                                                                                                                                                                                | [server](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/client.ipynb)                                           |
| **Conversational Retriever** LangServe経由で公開される[Conversational Retriever](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain)                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/client.ipynb) |
| **Agent** **会話履歴なし** [OpenAIツール](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)に基づく                                                                                                            | [server](https://github.com/langchain-ai/langserve/tree/main/examples/agent/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/agent/client.ipynb)                                                   |
| **Agent** **会話履歴あり** [OpenAIツール](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)に基づく                                                                                                               | [server](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/client.ipynb)                         |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history)により、クライアントから提供される`session_id`に基づいてバックエンドに保持されるチャットを実装。                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/client.ipynb)                   |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history)により、クライアントから提供される`conversation_id`および`user_id`（`user_id`を適切に実装するためのAuth参照）に基づいてバックエンドに保持されるチャットを実装。 | [server](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/client.ipynb) |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure)により、インデックス名の実行時設定をサポートするリトリーバーを作成。                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/client.ipynb)                 |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure)により、設定可能なフィールドおよび設定可能な代替案を示す。                                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/client.ipynb)                         |
| **APIHandler** `add_routes`の代わりに`APIHandler`を使用する方法を示します。これにより、開発者がエンドポイントを定義する柔軟性が増します。すべてのFastAPIパターンでうまく機能しますが、少し手間がかかります。                                                        | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py)                                                                                                                               |
| **LCEL Example** 辞書入力を操作するためにLCELを使用する例。                                                                                                                                                                                          | [server](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/client.ipynb)                             |
| **Auth** `add_routes`を使用：アプリに関連付けられたすべてのエンドポイントに適用できるシンプルな認証。（ユーザーロジックを実装するためのものではありません。）                                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                                   |
| **Auth** `add_routes`を使用：パス依存関係に基づくシンプルな認証メカニズム。（ユーザーロジックを実装するためのものではありません。）                                                                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                             |
| **Auth** `add_routes`を使用：ユーザーロジックとper request config modifierを使用するエンドポイントの認証を実装。（**注意**: 現時点では、OpenAPIドキュメントと統合されていません。）                                                                                 | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb)     |
| **Auth** `APIHandler`を使用：ユーザーロジックと認証を実装し、ユーザー所有ドキュメント内でのみ検索する方法を示します。                                                                                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)                             |
| **Widgets** プレイグラウンドで使用できるさまざまなウィジェット（ファイルアップロードとチャット）                                                                                                                                                                              | [server](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)                                                                                                                                |
| **Widgets** LangServeプレイグラウンドで使用されるファイルアップロードウィジェット。                                                                                                                                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb)                               |

## サンプルアプリケーション

### サーバー

OpenAIチャットモデル、Anthropicチャットモデルをデプロイし、
Anthropicモデルを使用してトピックについてジョークを伝えるチェーンをデプロイするサーバーはこちらです。

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatAnthropic", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.anthropic.ChatAnthropic.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatOpenAI", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.openai.ChatOpenAI.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
#!/usr/bin/env python
from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatAnthropic, ChatOpenAI
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)

add_routes(
    app,
    ChatAnthropic(),
    path="/anthropic",
)

model = ChatAnthropic()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
add_routes(
    app,
    prompt | model,
    path="/joke",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
```

エンドポイントをブラウザから呼び出す場合、CORSヘッダーを設定する必要があります。
FastAPIの組み込みミドルウェアを使用できます：

```python
from fastapi.middleware.cors import CORSMiddleware

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### ドキュメント

上記のサーバーをデプロイした場合、生成されたOpenAPIドキュメントを次の方法で表示できます：

> ⚠️ pydantic v2を使用する場合、_invoke_、_batch_、_stream_、_stream_log_のドキュメントは生成されません。詳細は[Pydantic](#pydantic)セクションを参照してください。

```sh
curl localhost:8000/docs
```

必ず`/docs`サフィックスを追加してください。

> ⚠️ インデックスページ`/`は**設計上**定義されていないため、`curl localhost:8000`またはURLにアクセスすると404が返されます。`/`にコンテンツを表示したい場合は、エンドポイント`@app.get("/")`を定義してください。

### クライアント

Python SDK

```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "HumanMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "RunnableMap", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableMap.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->

from langchain.schema import SystemMessage, HumanMessage
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableMap
from langserve import RemoteRunnable

openai = RemoteRunnable("http://localhost:8000/openai/")
anthropic = RemoteRunnable("http://localhost:8000/anthropic/")
joke_chain = RemoteRunnable("http://localhost:8000/joke/")

joke_chain.invoke({"topic": "parrots"})

# or async
await joke_chain.ainvoke({"topic": "parrots"})

prompt = [
    SystemMessage(content='Act like either a cat or a parrot.'),
    HumanMessage(content='Hello!')
]

# Supports astream
async for msg in anthropic.astream(prompt):
    print(msg, end="", flush=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "Tell me a long story about {topic}")]
)

# Can define custom chains
chain = prompt | RunnableMap({
    "openai": openai,
    "anthropic": anthropic,
})

chain.batch([{"topic": "parrots"}, {"topic": "cats"}])
```

TypeScriptの場合 (LangChain.jsバージョン0.0.166以降が必要):

```typescript
import { RemoteRunnable } from "@langchain/core/runnables/remote";

const chain = new RemoteRunnable({
  url: `http://localhost:8000/joke/`,
});
const result = await chain.invoke({
  topic: "cats",
});
```

Pythonで `requests` を使用:

```python
import requests

response = requests.post(
    "http://localhost:8000/joke/invoke",
    json={'input': {'topic': 'cats'}}
)
response.json()
```

`curl` を使用することもできます:

```sh
curl --location --request POST 'http://localhost:8000/joke/invoke' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "input": {
            "topic": "cats"
        }
    }'
```

## エンドポイント

以下のコード:

```python
...
add_routes(
    app,
    runnable,
    path="/my_runnable",
)
```

これらのエンドポイントをサーバーに追加します:

- `POST /my_runnable/invoke` - 単一の入力でランナブルを呼び出す
- `POST /my_runnable/batch` - バッチ入力でランナブルを呼び出す
- `POST /my_runnable/stream` - 単一の入力で呼び出し、出力をストリームする
- `POST /my_runnable/stream_log` - 単一の入力で呼び出し、中間ステップの出力を含む出力をストリームする
- `POST /my_runnable/astream_events` - 単一の入力で呼び出し、中間ステップからのイベントを含むイベントをストリームする
- `GET /my_runnable/input_schema` - ランナブルへの入力のためのjsonスキーマ
- `GET /my_runnable/output_schema` - ランナブルの出力のためのjsonスキーマ
- `GET /my_runnable/config_schema` - ランナブルの設定のためのjsonスキーマ

これらのエンドポイントは
[LangChain Expression Language interface](https://python.langchain.com/docs/expression_language/interface) に対応しています --
詳細はこのドキュメントを参照してください。

## プレイグラウンド

`/my_runnable/playground/` でランナブルのプレイグラウンドページを見つけることができます。これにより、ストリーミング出力と中間ステップを伴うランナブルを[設定](https://python.langchain.com/docs/expression_language/how_to/configure)して呼び出すためのシンプルなUIが提供されます。

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/5ca56e29-f1bb-40f4-84b5-15916384a276" width="50%"/>
</p>

### ウィジェット

プレイグラウンドは[ウィジェット](#playground-widgets)をサポートしており、異なる入力でランナブルをテストするために使用できます。詳細は以下の[ウィジェット](#widgets)セクションを参照してください。

### 共有

さらに、設定可能なランナブルの場合、プレイグラウンドではランナブルを設定し、その設定を含むリンクを共有することができます。

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/86ce9c59-f8e4-4d08-9fa3-62030e0f521d" width="50%"/>
</p>

## チャットプレイグラウンド

LangServeは、 `/my_runnable/playground/` で使用できるチャットフォーカスのプレイグラウンドもサポートしています。
一般的なプレイグラウンドとは異なり、特定のタイプのランナブルのみがサポートされます - ランナブルの入力スキーマは以下のいずれかである必要があります:

- 単一のキー、そのキーの値はチャットメッセージのリストである必要があります。
- 2つのキーがあり、一方の値がメッセージのリストで、もう一方が最新のメッセージを表します。

最初のフォーマットを使用することをお勧めします。

ランナブルは `AIMessage` または文字列を返す必要があります。

これを有効にするには、ルートを追加する際に `playground_type="chat",` を設定する必要があります。以下はその例です:

```python
# Declare a chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful, professional assistant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class InputChat(BaseModel):
    """Input for the chat endpoint."""

    messages: List[Union[HumanMessage, AIMessage, SystemMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
    )


add_routes(
    app,
    chain.with_types(input_type=InputChat),
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
    playground_type="chat",
)
```

LangSmithを使用している場合、 `enable_feedback_endpoint=True` をルートに設定して、各メッセージ後にサムズアップ/サムズダウンボタンを有効にし、 `enable_public_trace_link_endpoint=True` を設定して、実行のための公開トレースを作成するボタンを追加することもできます。以下の環境変数も設定する必要があります:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_PROJECT="YOUR_PROJECT_NAME"
export LANGCHAIN_API_KEY="YOUR_API_KEY"
```

以下の例は、上記の2つのオプションをオンにしたものです:

<p align="center">
<img src="./.github/img/chat_playground.png" width="50%"/>
</p>

注意: 公開トレースリンクを有効にすると、チェーンの内部が公開されます。この設定はデモやテストにのみ使用することをお勧めします。

## レガシーチェーン

LangServeは、[LangChain Expression Language](https://python.langchain.com/docs/expression_language/)を介して作成されたランナブルとレガシーチェーン (`Chain`から継承) の両方で動作します。
ただし、一部のレガシーチェーンの入力スキーマが不完全または不正確な場合があり、エラーが発生する可能性があります。
これは、それらのチェーンの `input_schema` プロパティをLangChainで更新することで修正できます。
エラーが発生した場合は、このリポジトリに問題を報告してください。解決に努めます。

## デプロイ

### AWSへのデプロイ

[AWS Copilot CLI](https://aws.github.io/copilot-cli/)を使用してAWSにデプロイできます

```bash
copilot init --app [application-name] --name [service-name] --type 'Load Balanced Web Service' --dockerfile './Dockerfile' --deploy
```

詳細は[こちら](https://aws.amazon.com/containers/copilot/)をクリックしてください。

### Azureへのデプロイ

Azure Container Apps (サーバーレス) を使用してAzureにデプロイできます:

```shell
az containerapp up --name [container-app-name] --source . --resource-group [resource-group-name] --environment  [environment-name] --ingress external --target-port 8001 --env-vars=OPENAI_API_KEY=your_key
```

詳細は[こちら](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up)を参照してください。

### GCPへのデプロイ

以下のコマンドを使用してGCP Cloud Runにデプロイできます:

```shell
gcloud run deploy [your-service-name] --source . --port 8001 --allow-unauthenticated --region us-central1 --set-env-vars=OPENAI_API_KEY=your_key
```

### コミュニティによる貢献

#### Railwayへのデプロイ

[Railwayの例のリポジトリ](https://github.com/PaulLockett/LangServe-Railway/tree/main)

[![Railwayでデプロイ](https://railway.app/button.svg)](https://railway.app/template/pW9tXP?referralCode=c-aq4K)

## Pydantic

LangServeは制限付きでPydantic 2をサポートします。

1. Pydantic V2を使用する場合、invoke/batch/stream/stream_logのOpenAPIドキュメントは生成されません。Fast APIは[pydantic v1とv2の名前空間の混在]をサポートしていません。
2. LangChainはPydantic v2でv1の名前空間を使用します。LangChainとの互換性を確保するための[ガイドライン](https://github.com/langchain-ai/langchain/discussions/9337)をお読みください。

これらの制限を除いて、APIエンドポイント、プレイグラウンド、およびその他の機能が期待通りに動作することを期待しています。

## 高度な設定

### 認証の取り扱い

サーバーに認証を追加する必要がある場合は、Fast APIの[依存関係](https://fastapi.tiangolo.com/tutorial/dependencies/)と[セキュリティ](https://fastapi.tiangolo.com/tutorial/security/)に関するドキュメントをお読みください。

以下の例は、FastAPIのプリミティブを使用してLangServeエンドポイントに認証ロジックを接続する方法を示しています。

実際の認証ロジック、ユーザーテーブルなどを提供する責任はあなたにあります。

何をしているのかよくわからない場合は、既存のソリューション [Auth0](https://auth0.com/) を試してみるとよいでしょう。

#### add_routesを使用する場合

`add_routes`を使用する場合は、以下の
例を参照してください [here](https://github.com/langchain-ai/langserve/tree/main/examples/auth)。

| 説明                                                                                                                                                                        | リンク                                                                                                                                                                                                                           |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** with `add_routes`: アプリに関連付けられたすべてのエンドポイントに適用できるシンプルな認証。(ユーザーごとのロジックを実装するためには役に立ちません。)           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                               |
| **Auth** with `add_routes`: パス依存関係に基づくシンプルな認証メカニズム。(ユーザーごとのロジックを実装するためには役に立ちません。)                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                         |
| **Auth** with `add_routes`: リクエストごとの設定モディファイアを使用するエンドポイントのためにユーザーごとのロジックと認証を実装します。(**注**: 現時点ではOpenAPIドキュメントと統合されていません。) | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb) |

代わりにFastAPIの[ミドルウェア](https://fastapi.tiangolo.com/tutorial/middleware/)を使用することもできます。

グローバル依存関係とパス依存関係を使用する利点は、認証がOpenAPIドキュメントページに適切にサポートされることですが、
これらはユーザーごとのロジックを実装するには十分ではありません（例: ユーザー所有のドキュメント内のみを検索できるアプリケーションの作成）。

ユーザーごとのロジックを実装する必要がある場合は、`per_req_config_modifier`または`APIHandler`（以下）を使用してこのロジックを実装できます。

**ユーザーごと**

ユーザー依存の認証またはロジックが必要な場合、
`add_routes`を使用する際に`per_req_config_modifier`を指定します。呼び出し可能なオブジェクトは
生の`Request`オブジェクトを受け取り、認証および
認可の目的で関連情報を抽出できます。

#### APIHandlerを使用する場合

FastAPIとPythonに慣れている場合は、LangServeの[APIHandler](https://github.com/langchain-ai/langserve/blob/main/examples/api_handler_examples/server.py)を使用することができます。

| 説明                                                                                                                                                                                                 | リンク                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** with `APIHandler`: ユーザー所有のドキュメント内のみを検索する方法を示す、ユーザーごとのロジックと認証を実装します。                                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)         |
| **APIHandler** `APIHandler`を`add_routes`の代わりに使用する方法を示します。これにより開発者はエンドポイントを定義する柔軟性が増し、すべてのFastAPIパターンでうまく機能しますが、もう少し手間がかかります。 | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/client.ipynb) |

もう少し手間がかかりますが、エンドポイント定義に完全なコントロールを提供するため、認証のためのカスタムロジックを何でも実行できます。

### ファイル

LLMアプリケーションはしばしばファイルを扱います。ファイル処理を実装するための異なるアーキテクチャがあります。高レベルでは以下のとおりです。

1. 専用のエンドポイントを介してサーバーにファイルをアップロードし、別のエンドポイントで処理する
2. ファイルを値（ファイルのバイト）または参照（例：s3 URL）でアップロードする
3. 処理エンドポイントはブロッキングまたはノンブロッキングである
4. かなりの処理が必要な場合、その処理は専用のプロセスプールにオフロードされることがある

あなたのアプリケーションに適したアーキテクチャを決定する必要があります。

現在、ランナブルにファイルを値でアップロードするには、ファイルをbase64エンコードして使用します（`multipart/form-data`はまだサポートされていません）。

ここに
[例](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)があります
これは、base64エンコードを使用してリモートのランナブルにファイルを送信する方法を示しています。

覚えておいてください、常に参照（例：s3 URL）でファイルをアップロードするか、専用のエンドポイントにmultipart/form-dataとしてアップロードすることができます。

### カスタム入力および出力タイプ

入力および出力タイプはすべてのランナブルで定義されています。

これらには`input_schema`および`output_schema`プロパティを介してアクセスできます。

`LangServe`はこれらのタイプを検証およびドキュメント化のために使用します。

デフォルトの推測タイプを上書きしたい場合は、`with_types`メソッドを使用できます。

次の簡単な例でアイデアを説明します：

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from typing import Any

from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

app = FastAPI()


def func(x: Any) -> int:
    """Mistyped function that should accept an int but accepts anything."""
    return x + 1


runnable = RunnableLambda(func).with_types(
    input_type=int,
)

add_routes(app, runnable)
```

### カスタムユーザータイプ

データを同等の辞書表現ではなくpydanticモデルにデシリアライズしたい場合は、`CustomUserType`を継承します。

現時点では、このタイプは_サーバー_側でのみ動作し、_デコード_動作を指定するために使用されます。このタイプから継承する場合、サーバーはデコードされたタイプを辞書に変換するのではなくpydanticモデルとして保持します。

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

from langserve import add_routes
from langserve.schema import CustomUserType

app = FastAPI()


class Foo(CustomUserType):
    bar: int


def func(foo: Foo) -> int:
    """Sample function that expects a Foo type which is a pydantic model"""
    assert isinstance(foo, Foo)
    return foo.bar


# Note that the input and output type are automatically inferred!
# You do not need to specify them.
# runnable = RunnableLambda(func).with_types( # <-- Not needed in this case
#     input_type=Foo,
#     output_type=int,
#
add_routes(app, RunnableLambda(func), path="/foo")
```

### プレイグラウンドウィジェット

プレイグラウンドでは、バックエンドからランナブル用のカスタムウィジェットを定義できます。

以下はいくつかの例です：

| 説明                                                                           | リンク                                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ウィジェット** プレイグラウンドで使用できる異なるウィジェット（ファイルアップロードとチャット） | [サーバー](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py), [クライアント](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/client.ipynb)     |
| **ウィジェット** LangServeプレイグラウンド用のファイルアップロードウィジェット                         | [サーバー](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [クライアント](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb) |

#### スキーマ

- ウィジェットはフィールドレベルで指定され、入力タイプのJSONスキーマの一部として送信されます
- ウィジェットには`type`というキーが含まれている必要があり、その値はよく知られたウィジェットのリストの1つです
- 他のウィジェットキーはJSONオブジェクト内のパスを説明する値と関連付けられます

```typescript
type JsonPath = number | string | (number | string)[];
type NameSpacedPath = { title: string; path: JsonPath }; // Using title to mimick json schema, but can use namespace
type OneOfPath = { oneOf: JsonPath[] };

type Widget = {
  type: string; // Some well known type (e.g., base64file, chat etc.)
  [key: string]: JsonPath | NameSpacedPath | OneOfPath;
};
```

### 利用可能なウィジェット

現在、ユーザーが手動で指定できるウィジェットは2つだけです：

1. ファイルアップロードウィジェット
2. チャット履歴ウィジェット

これらのウィジェットに関する詳細は以下を参照してください。

プレイグラウンドUIの他のすべてのウィジェットは、ランナブルの設定スキーマに基づいてUIによって自動的に作成および管理されます。設定可能なランナブルを作成すると、プレイグラウンドはその動作を制御するために適切なウィジェットを作成します。

#### ファイルアップロードウィジェット

base64エンコードされた文字列としてアップロードされたファイル用のファイルアップロード入力をUIプレイグラウンドに作成できます。以下は
完全な[例](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)です。

スニペット：

```python
try:
    from pydantic.v1 import Field
except ImportError:
    from pydantic import Field

from langserve import CustomUserType


# ATTENTION: Inherit from CustomUserType instead of BaseModel otherwise
#            the server will decode it into a dict instead of a pydantic model.
class FileProcessingRequest(CustomUserType):
    """Request including a base64 encoded file."""

    # The extra field is used to specify a widget for the playground UI.
    file: str = Field(..., extra={"widget": {"type": "base64file"}})
    num_chars: int = 100

```

ウィジェットの例：

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/52199e46-9464-4c2e-8be8-222250e08c3f" width="50%"/>
</p>

### チャットウィジェット

[ウィジェットの例](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)
をご覧ください。

チャットウィジェットを定義するには、「type": "chat」を渡すことを確認してください。

- "input"は、新しい入力メッセージを持つ_Request_のフィールドへのJSONPathです。
- "output"は、新しい出力メッセージを持つ_Response_のフィールドへのJSONPathです。
- 全体の入力または出力をそのまま使用する場合は、これらのフィールドを指定しないでください（例：出力がチャットメッセージのリストである場合）。

以下はスニペットです：

```python
class ChatHistory(CustomUserType):
    chat_history: List[Tuple[str, str]] = Field(
        ...,
        examples=[[("human input", "ai response")]],
        extra={"widget": {"type": "chat", "input": "question", "output": "answer"}},
    )
    question: str


def _format_to_messages(input: ChatHistory) -> List[BaseMessage]:
    """Format the input to a list of messages."""
    history = input.chat_history
    user_input = input.question

    messages = []

    for human, ai in history:
        messages.append(HumanMessage(content=human))
        messages.append(AIMessage(content=ai))
    messages.append(HumanMessage(content=user_input))
    return messages


model = ChatOpenAI()
chat_model = RunnableParallel({"answer": (RunnableLambda(_format_to_messages) | model)})
add_routes(
    app,
    chat_model.with_types(input_type=ChatHistory),
    config_keys=["configurable"],
    path="/chat",
)
```

ウィジェットの例：

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/a71ff37b-a6a9-4857-a376-cf27c41d3ca4" width="50%"/>
</p>

このスニペットに示されているように、パラメータとしてメッセージのリストを直接指定することもできます：

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assisstant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class MessageListInput(BaseModel):
    """Input for the chat endpoint."""
    messages: List[Union[HumanMessage, AIMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
        extra={"widget": {"type": "chat", "input": "messages"}},
    )


add_routes(
    app,
    chain.with_types(input_type=MessageListInput),
    path="/chat",
)
```

例については[このサンプルファイル](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/message_list/server.py)を参照してください。

### エンドポイントの有効化 / 無効化 (LangServe >=0.0.33)

特定のチェーンのルートを追加する際に、公開するエンドポイントを有効/無効にすることができます。

`enabled_endpoints`を使用すると、langserveを新しいバージョンにアップグレードする際に新しいエンドポイントを取得しないようにすることができます。

有効化：以下のコードは`invoke`、`batch`および対応する`config_hash`エンドポイントのバリアントのみを有効にします。

```python
add_routes(app, chain, enabled_endpoints=["invoke", "batch", "config_hashes"], path="/mychain")
```

無効化：以下のコードはチェーンのプレイグラウンドを無効にします

```python
add_routes(app, chain, disabled_endpoints=["playground"], path="/mychain")
```
