---
translated: true
---

# カスタムチャットモデル

このガイドでは、LangChainアブストラクションを使ってカスタムチャットモデルを作成する方法を学びます。

標準の `BaseChatModel` インターフェースでLLMをラップすることで、最小限のコード変更でLLMをLangChainプログラムで使用できるようになります!

さらに、LLMはLangChainの `Runnable` になり、バッチ処理、非同期サポート、`astream_events` APIなどの最適化を自動的に活用できるようになります。

## 入力と出力

まず、チャットモデルの入力と出力である **メッセージ** について説明します。

### メッセージ

チャットモデルは入力としてメッセージを受け取り、メッセージを出力します。

LangChainには以下のようなビルトインのメッセージタイプがあります:

| メッセージタイプ      | 説明                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `SystemMessage`       | AIの動作をプライミングするために使用されます。通常、一連の入力メッセージの最初に渡されます。   |
| `HumanMessage`        | ユーザーとのやり取りを表します。                                                           |
| `AIMessage`           | チャットモデルからの出力を表します。これはテキストまたはツールの呼び出しリクエストになります。|
| `FunctionMessage` / `ToolMessage` | ツールの呼び出し結果をモデルに返すためのメッセージ。                           |
| `AIMessageChunk` / `HumanMessageChunk` / ... | それぞれのメッセージタイプのチャンク版。                           |

:::note
`ToolMessage` と `FunctionMessage` は、OpenAIの `function` と `tool` ロールに密接に従っています。

この分野は急速に発展しており、より多くのモデルが関数呼び出し機能を追加するにつれ、このスキーマにさらに追加が行われることが予想されます。
:::

```python
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    FunctionMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
```

### ストリーミング版

すべてのチャットメッセージには、名前に `Chunk` を含むストリーミング版があります。

```python
from langchain_core.messages import (
    AIMessageChunk,
    FunctionMessageChunk,
    HumanMessageChunk,
    SystemMessageChunk,
    ToolMessageChunk,
)
```

これらのチャンクは、チャットモデルからのストリーミング出力に使用され、すべて加算プロパティを定義しています。

```python
AIMessageChunk(content="Hello") + AIMessageChunk(content=" World!")
```

```output
AIMessageChunk(content='Hello World!')
```

## ベースチャットモデル

最後のメッセージプロンプトの最初の `n` 文字を返すチャットモデルを実装しましょう!

そのために、`BaseChatModel` を継承し、以下を実装する必要があります:

| メソッド/プロパティ     | 説明                                                       | 必須/オプション  |
|------------------------------------|-------------------------------------------------------------------|--------------------|
| `_generate`                        | プロンプトからチャット結果を生成するために使用                       | 必須           |
| `_llm_type` (プロパティ)             | モデルの種類を一意に識別するために使用。ログ記録に使用。| 必須           |
| `_identifying_params` (プロパティ)   | トレース目的のモデルパラメータ化を表す。                            | オプション           |
| `_stream`                          | ストリーミングを実装するために使用。                                       | オプション           |
| `_agenerate`                       | ネイティブの非同期メソッドを実装するために使用。                           | オプション           |
| `_astream`                         | `_stream` の非同期バージョンを実装するために使用。                      | オプション           |

:::tip
`_astream` の実装では、`_stream` が実装されている場合は `run_in_executor` を使ってそれを別スレッドで起動し、そうでない場合は `_agenerate` にフォールバックします。

この方法を使えば `_stream` の実装を再利用できますが、ネイティブの非同期コードを実装できる場合はそちらの方が良いソリューションです。オーバーヘッドが少なくなります。
:::

### 実装

```python
from typing import Any, AsyncIterator, Dict, Iterator, List, Optional

from langchain_core.callbacks import (
    AsyncCallbackManagerForLLMRun,
    CallbackManagerForLLMRun,
)
from langchain_core.language_models import BaseChatModel, SimpleChatModel
from langchain_core.messages import AIMessageChunk, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from langchain_core.runnables import run_in_executor


class CustomChatModelAdvanced(BaseChatModel):
    """A custom chat model that echoes the first `n` characters of the input.

    When contributing an implementation to LangChain, carefully document
    the model including the initialization parameters, include
    an example of how to initialize the model and include any relevant
    links to the underlying models documentation or API.

    Example:

        .. code-block:: python

            model = CustomChatModel(n=2)
            result = model.invoke([HumanMessage(content="hello")])
            result = model.batch([[HumanMessage(content="hello")],
                                 [HumanMessage(content="world")]])
    """

    model_name: str
    """The name of the model"""
    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Override the _generate method to implement the chat model logic.

        This can be a call to an API, a call to a local model, or any other
        implementation that generates a response to the input prompt.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        # Replace this with actual logic to generate a response from a list
        # of messages.
        last_message = messages[-1]
        tokens = last_message.content[: self.n]
        message = AIMessage(
            content=tokens,
            additional_kwargs={},  # Used to add additional payload (e.g., function calling request)
            response_metadata={  # Use for response metadata
                "time_in_seconds": 3,
            },
        )
        ##

        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """Stream the output of the model.

        This method should be implemented if the model can generate output
        in a streaming fashion. If the model does not support streaming,
        do not implement it. In that case streaming requests will be automatically
        handled by the _generate method.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        last_message = messages[-1]
        tokens = last_message.content[: self.n]

        for token in tokens:
            chunk = ChatGenerationChunk(message=AIMessageChunk(content=token))

            if run_manager:
                # This is optional in newer versions of LangChain
                # The on_llm_new_token will be called automatically
                run_manager.on_llm_new_token(token, chunk=chunk)

            yield chunk

        # Let's add some other information (e.g., response metadata)
        chunk = ChatGenerationChunk(
            message=AIMessageChunk(content="", response_metadata={"time_in_sec": 3})
        )
        if run_manager:
            # This is optional in newer versions of LangChain
            # The on_llm_new_token will be called automatically
            run_manager.on_llm_new_token(token, chunk=chunk)
        yield chunk

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model."""
        return "echoing-chat-model-advanced"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters.

        This information is used by the LangChain callback system, which
        is used for tracing purposes make it possible to monitor LLMs.
        """
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": self.model_name,
        }
```

### テストしてみましょう 🧪

このチャットモデルは、LangChainの標準的な `Runnable` インターフェースを実装しているので、LangChainのアブストラクションの多くがサポートしています!

```python
model = CustomChatModelAdvanced(n=3, model_name="my_custom_model")
```

```python
model.invoke(
    [
        HumanMessage(content="hello!"),
        AIMessage(content="Hi there human!"),
        HumanMessage(content="Meow!"),
    ]
)
```

```output
AIMessage(content='Meo', response_metadata={'time_in_seconds': 3}, id='run-ddb42bd6-4fdd-4bd2-8be5-e11b67d3ac29-0')
```

```python
model.invoke("hello")
```

```output
AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-4d3cc912-44aa-454b-977b-ca02be06c12e-0')
```

```python
model.batch(["hello", "goodbye"])
```

```output
[AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-9620e228-1912-4582-8aa1-176813afec49-0'),
 AIMessage(content='goo', response_metadata={'time_in_seconds': 3}, id='run-1ce8cdf8-6f75-448e-82f7-1bb4a121df93-0')]
```

```python
for chunk in model.stream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

モデルの `_astream` の実装を確認してください! 実装していない場合、出力がストリーミングされません。

```python
async for chunk in model.astream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

`astream_events` APIを使ってみましょう。コールバックが正しく実装されていることを確認できます。

```python
async for event in model.astream_events("cat", version="v1"):
    print(event)
```

```output
{'event': 'on_chat_model_start', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'name': 'CustomChatModelAdvanced', 'tags': [], 'metadata': {}, 'data': {'input': 'cat'}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='c', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='a', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='t', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_end', 'name': 'CustomChatModelAdvanced', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'data': {'output': AIMessageChunk(content='cat', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}

/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

## 貢献

チャットモデルの統合への貢献を歓迎しています。

LangChainに追加されるようにするためのチェックリストは以下の通りです:

ドキュメンテーション:

* モデルの初期化引数にはドキュメントストリングが含まれている必要があります。これらは [APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html) に表示されます。
* モデルのクラスドキュメントには、サービスによって提供されるモデルの場合はモデルのAPIへのリンクが含まれている必要があります。

テスト:

* [ ] オーバーライドしたメソッドにユニットテストまたは統合テストを追加してください。`invoke`、`ainvoke`、`batch`、`stream`が正しく動作することを確認してください。

ストリーミング (実装する場合):

* [ ] `_stream` メソッドを実装してストリーミングを実現してください

ストップトークンの動作:

* [ ] ストップトークンが尊重されるようにする必要があります
* [ ] ストップトークンは応答の一部として含まれるべきです

秘密のAPIキー:

* [ ] モデルがAPIに接続する場合、初期化時にAPIキーを受け取る可能性があります。 SecretStrタイプを使ってシークレットを保護し、誤ってプリントアウトされないようにしてください。

識別パラメータ:

* [ ] `model_name` を識別パラメータに含めてください

最適化:

ネイティブの非同期サポートを提供することで、モデルのオーバーヘッドを削減できます!

* [ ] `_agenerate` (`ainvoke` で使用) のネイティブ非同期を提供してください
* [ ] `_astream` (` astream` で使用) のネイティブ非同期を提供してください
