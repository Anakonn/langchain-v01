---
translated: true
---

# カスタムLLM

このノートブックでは、自分のLLMや、LangChainでサポートされていない別のラッパーを使用したい場合に、カスタムLLMラッパーを作成する方法について説明します。

標準の`LLM`インターフェースでLLMをラップすることで、最小限のコード変更でLangChainのプログラムでLLMを使用できるようになります。

さらに、LLMはLangChainの`Runnable`になり、ボーナスとして、ボックス外の最適化、非同期サポート、`astream_events` APIなどの恩恵を受けられます。

## 実装

カスタムLLMが実装する必要のある必須のメソッドは2つだけです:

| メソッド      | 説明                                                                     |
|---------------|------------------------------------------------------------------------|
| `_call`       | 文字列と任意のストップワードを受け取り、文字列を返します。`invoke`で使用されます。 |
| `_llm_type`   | 文字列を返すプロパティ。ログ目的でのみ使用されます。                         |

オプションの実装:

| メソッド     | 説明                                                                                                |
|----------------------|-----------------------------------------------------------------------------------------------------|
| `_identifying_params` | モデルの識別と印刷に役立つ辞書を返す**プロパティ**。                                                |
| `_acall`              | `_call`の非同期ネイティブ実装。`ainvoke`で使用されます。                                           |
| `_stream`             | トークンごとに出力をストリーミングするメソッド。                                                     |
| `_astream`            | `_stream`の非同期ネイティブ実装。新しいLangChainバージョンでは、デフォルトで`_stream`になります。 |

入力の最初のn文字を返す単純なカスタムLLMを実装してみましょう。

```python
from typing import Any, Dict, Iterator, List, Mapping, Optional

from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models.llms import LLM
from langchain_core.outputs import GenerationChunk


class CustomLLM(LLM):
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

    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Run the LLM on the given input.

        Override this method to implement the LLM logic.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of the stop substrings.
                If stop tokens are not supported consider raising NotImplementedError.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            The model output as a string. Actual completions SHOULD NOT include the prompt.
        """
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")
        return prompt[: self.n]

    def _stream(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[GenerationChunk]:
        """Stream the LLM on the given prompt.

        This method should be overridden by subclasses that support streaming.

        If not implemented, the default behavior of calls to stream will be to
        fallback to the non-streaming version of the model and return
        the output as a single chunk.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of these substrings.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            An iterator of GenerationChunks.
        """
        for char in prompt[: self.n]:
            chunk = GenerationChunk(text=char)
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)

            yield chunk

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters."""
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": "CustomChatModel",
        }

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model. Used for logging purposes only."""
        return "custom"
```

### テストしてみましょう 🧪

このLLMはLangChainの標準的な`Runnable`インターフェースを実装しているので、LangChainの多くの抽象化がサポートしています。

```python
llm = CustomLLM(n=5)
print(llm)
```

```output
[1mCustomLLM[0m
Params: {'model_name': 'CustomChatModel'}
```

```python
llm.invoke("This is a foobar thing")
```

```output
'This '
```

```python
await llm.ainvoke("world")
```

```output
'world'
```

```python
llm.batch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
await llm.abatch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
async for token in llm.astream("hello"):
    print(token, end="|", flush=True)
```

```output
h|e|l|l|o|
```

他の`LangChain` APIとうまく統合されることを確認しましょう。

```python
from langchain_core.prompts import ChatPromptTemplate
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "you are a bot"), ("human", "{input}")]
)
```

```python
llm = CustomLLM(n=7)
chain = prompt | llm
```

```python
idx = 0
async for event in chain.astream_events({"input": "hello there!"}, version="v1"):
    print(event)
    idx += 1
    if idx > 7:
        # Truncate
        break
```

```output
{'event': 'on_chain_start', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'name': 'RunnableSequence', 'tags': [], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_start', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_end', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}, 'output': ChatPromptValue(messages=[SystemMessage(content='you are a bot'), HumanMessage(content='hello there!')])}}
{'event': 'on_llm_start', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'input': {'prompts': ['System: you are a bot\nHuman: hello there!']}}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'S'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'S'}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'y'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'y'}}
```

## 貢献

チャットモデルの統合への貢献を歓迎します。

LangChainに追加されるようにするためのチェックリストは以下の通りです:

ドキュメンテーション:

* モデルの初期化引数にはドキュメンテーションが含まれている必要があります。これらは[APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html)に表示されます。
* モデルのクラスドキュメンテーションには、モデルがサービスによって提供されている場合はモデルのAPIへのリンクが含まれている必要があります。

テスト:

* [ ] オーバーライドしたメソッドに単体テストまたは統合テストを追加してください。`invoke`、`ainvoke`、`batch`、`stream`が正しく動作することを確認してください。

ストリーミング(実装する場合):

* [ ] `on_llm_new_token`コールバックを呼び出すようにしてください
* [ ] `on_llm_new_token`はチャンクを返す前に呼び出される必要があります

ストップトークンの動作:

* [ ] ストップトークンが尊重されるようにする必要があります
* [ ] ストップトークンは応答の一部として含まれる必要があります

秘密のAPIキー:

* [ ] モデルがAPIに接続する場合、初期化時にAPIキーを受け入れる可能性があります。SecretStrタイプを使用して秘密を保護し、モデルを印刷したときに誤ってプリントアウトされないようにしてください。
