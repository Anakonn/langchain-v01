---
translated: true
---

# チャットボットフィードバックテンプレート

このテンプレートは、ユーザーからの明示的なフィードバックなしでチャットボットを評価する方法を示しています。[chain.py](https://github.com/langchain-ai/langchain/blob/master/templates/chat-bot-feedback/chat_bot_feedback/chain.py)にシンプルなチャットボットを定義し、ユーザーの応答に基づいてボットの応答の有効性をスコア化するカスタムの評価器を定義しています。このテンプレートの評価器を自分のチャットボットに適用することで、サービスを提供する前に評価することができます。また、このテンプレートを使ってチャットアプリを直接デプロイすることもできます。

[チャットボット](https://python.langchain.com/docs/use_cases/chatbots)は、LLMをデプロイする最も一般的なインターフェースの1つです。チャットボットの品質は様々で、継続的な開発が重要です。しかし、ユーザーは親指アップやダウンのボタンなどの明示的なフィードバックを残すことが少ないのが現状です。さらに、「セッション長」や「会話長」などの従来の分析指標では明確さに欠けることが多いのが問題です。しかし、チャットボットとの複数回の会話には多くの情報が含まれており、これらを指標に変換することで、ファインチューニング、評価、プロダクト分析に活用できます。

[Chat Langchain](https://chat.langchain.com/)を事例として見ると、すべてのクエリの0.04%しか明示的なフィードバックが得られていません。しかし、約70%のクエリが前の質問の続きです。これらの続きの質問の多くには、前のAI応答の品質を推測できる有用な情報が含まれています。

このテンプレートは、この「フィードバックの希少性」の問題を解決するのに役立ちます。以下は、このチャットボットを呼び出す例です:

[](https://smith.langchain.com/public/3378daea-133c-4fe8-b4da-0a3044c5dbe8/r?runtab=1)

ユーザーがこの応答([リンク](https://smith.langchain.com/public/a7e2df54-4194-455d-9978-cecd8be0df1e/r)))に応答すると、応答評価器が呼び出され、以下のような評価結果が得られます:

[](https://smith.langchain.com/public/534184ee-db8f-4831-a386-3f578145114c/r)

示されているように、評価器はユーザーが徐々に不満を感じていることを認識し、前の応答が効果的ではなかったことを示しています。

## LangSmith フィードバック

[LangSmith](https://smith.langchain.com/)は、本番環境向けのLLMアプリケーションを構築するためのプラットフォームです。デバッグやオフラインの評価機能に加えて、LangSmithはユーザーとモデルアシストのフィードバックを捕捉し、LLMアプリケーションを改善するのに役立ちます。このテンプレートでは、LLMを使ってアプリケーションのフィードバックを生成し、サービスを継続的に改善するのに活用できます。LangSmithを使ったフィードバックの収集の詳細については、[ドキュメント](https://docs.smith.langchain.com/cookbook/feedback-examples)を参照してください。

## 評価器の実装

ユーザーのフィードバックは、カスタムの `RunEvaluator` によって推測されます。この評価器は `EvaluatorCallbackHandler` を使って呼び出され、チャットボットのランタイムに干渉しないよう別スレッドで実行されます。以下の関数を使って、任意の互換性のあるチャットボットにこのカスタム評価器を適用できます:

```python
my_chain.with_config(
    callbacks=[
        EvaluatorCallbackHandler(
            evaluators=[
                ResponseEffectivenessEvaluator(evaluate_response_effectiveness)
            ]
        )
    ],
)
```

評価器は、特に `gpt-3.5-turbo` というLLMを使って、AIの最新のチャットメッセージをユーザーのフォローアップ応答に基づいて評価します。スコアと理由付けを生成し、それをLangSmithのフィードバックに変換して、`last_run_id` として提供された値に適用します。

LLM内で使用されるプロンプト[はハブで入手可能](https://smith.langchain.com/hub/wfh/response-effectiveness)です。アプリのコンテキスト(アプリの目的や、それが回答すべき質問の種類など)や、LLMに注目してほしい「症状」などを追加してカスタマイズすることができます。この評価器はまた、OpenAIの関数呼び出しAPIを利用して、より一貫性のある構造化された出力を得ています。

## 環境変数

OpenAIモデルを使用するには、`OPENAI_API_KEY` を設定する必要があります。また、`LANGSMITH_API_KEY` を設定してLangSmithを構成する必要があります。

```bash
export OPENAI_API_KEY=sk-...
export LANGSMITH_API_KEY=...
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=my-project # Set to the project you want to save to
```

## 使用方法

`LangServe` でデプロイする場合は、サーバーがコールバックイベントを返すように構成することをお勧めします。これにより、`RemoteRunnable` を使って生成するトレースにバックエンドのトレースが含まれるようになります。

```python
from chat_bot_feedback.chain import chain

add_routes(app, chain, path="/chat-bot-feedback", include_callback_events=True)
```

サーバーが起動したら、以下のコードスニペットを使って2ターンの会話のチャットボットの応答をストリーミングできます。

```python
<!--IMPORTS:[{"imported": "tracing_v2_enabled", "source": "langchain.callbacks.manager", "docs": "https://api.python.langchain.com/en/latest/tracers/langchain_core.tracers.context.tracing_v2_enabled.html", "title": "Chat Bot Feedback Template"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.base.BaseMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat Bot Feedback Template"}]-->
from functools import partial
from typing import Dict, Optional, Callable, List
from langserve import RemoteRunnable
from langchain.callbacks.manager import tracing_v2_enabled
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage

# Update with the URL provided by your LangServe server
chain = RemoteRunnable("http://127.0.0.1:8031/chat-bot-feedback")

def stream_content(
    text: str,
    chat_history: Optional[List[BaseMessage]] = None,
    last_run_id: Optional[str] = None,
    on_chunk: Callable = None,
):
    results = []
    with tracing_v2_enabled() as cb:
        for chunk in chain.stream(
            {"text": text, "chat_history": chat_history, "last_run_id": last_run_id},
        ):
            on_chunk(chunk)
            results.append(chunk)
        last_run_id = cb.latest_run.id if cb.latest_run else None
    return last_run_id, "".join(results)

chat_history = []
text = "Where are my keys?"
last_run_id, response_message = stream_content(text, on_chunk=partial(print, end=""))
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
text = "I CAN'T FIND THEM ANYWHERE"  # The previous response will likely receive a low score,
# as the user's frustration appears to be escalating.
last_run_id, response_message = stream_content(
    text,
    chat_history=chat_history,
    last_run_id=str(last_run_id),
    on_chunk=partial(print, end=""),
)
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
```

これは `tracing_v2_enabled` コールバックマネージャを使って呼び出しのランID を取得し、同じチャットスレッド内の後続の呼び出しでそれを提供することで、評価器が適切なトレースにフィードバックを割り当てられるようにしています。

## 結論

このテンプレートは、LangServeを使って直接デプロイできるシンプルなチャットボット定義を提供しています。ユーザーの評価なしにボットの評価フィードバックを記録するためのカスタムの評価器を定義しています。これは、分析を補完し、ファインチューニングや評価のためのデータポイントを better 選択する効果的な方法です。
