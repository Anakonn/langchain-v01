---
sidebar_position: 0
title: クイックスタート
translated: true
---

# クイックスタート

チャットモデルは言語モデルの一種です。
チャットモデルは内部で言語モデルを使用しますが、使用するインターフェースが少し異なります。
「テキスト入力、テキスト出力」APIの代わりに、「チャットメッセージ」が入力と出力として使われるインターフェースを使用します。

## セットアップ

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="chat" />

環境変数を設定したくない場合は、チャットモデルクラスを初期化する際にapi key引数の名前付きパラメータを介してキーを直接渡すことができます：

<ChatModelTabs
  anthropicParams={`model="claude-3-sonnet-20240229", api_key="..."`}
  openaiParams={`model="gpt-3.5-turbo-0125", api_key="..."`}
  mistralParams={`model="mistral-large-latest", api_key="..."`}
  fireworksParams={`model="accounts/fireworks/models/mixtral-8x7b-instruct", api_key="..."`}
  googleParams={`model="gemini-pro", google_api_key="..."`}
  togetherParams={`, together_api_key="..."`}
  customVarName="chat"
/>

## メッセージ

チャットモデルインターフェースは生のテキストではなく、メッセージを中心に構築されています。
現在LangChainでサポートされているメッセージの種類は、`AIMessage`、`HumanMessage`、`SystemMessage`、`FunctionMessage`、および`ChatMessage`です。`ChatMessage`は任意の役割パラメータを取ります。ほとんどの場合、`HumanMessage`、`AIMessage`、および`SystemMessage`を扱うことになります。

## LCEL

チャットモデルは[Runnableインターフェース](/docs/expression_language/interface)を実装しており、これは[LangChain Expression Language (LCEL)](/docs/expression_language/)の基本的な構成要素です。これにより、`invoke`、`ainvoke`、`stream`、`astream`、`batch`、`abatch`、`astream_log`呼び出しをサポートします。

チャットモデルは入力として`List[BaseMessage]`を受け入れます。また、`str`（`HumanMessage`に変換される）や`PromptValue`を含む、メッセージに強制変換できるオブジェクトも受け入れます。

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You're a helpful assistant"),
    HumanMessage(content="What is the purpose of model regularization?"),
]
```

```python
# | output: false
# | echo: false

from langchain_openai import ChatOpenAI

chat = ChatOpenAI()
```

```python
chat.invoke(messages)
```

```output
AIMessage(content="The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to fit the noise in the training data, leading to poor generalization on unseen data. Regularization techniques introduce additional constraints or penalties to the model's objective function, discouraging it from becoming overly complex and promoting simpler and more generalizable models. Regularization helps to strike a balance between fitting the training data well and avoiding overfitting, leading to better performance on new, unseen data.")
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
The purpose of model regularization is to prevent overfitting and improve the generalization of a machine learning model. Overfitting occurs when a model is too complex and learns the noise or random variations in the training data, which leads to poor performance on new, unseen data. Regularization techniques introduce additional constraints or penalties to the model's learning process, discouraging it from fitting the noise and reducing the complexity of the model. This helps to improve the model's ability to generalize well and make accurate predictions on unseen data.
```

```python
chat.batch([messages])
```

```output
[AIMessage(content="The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to learn the noise or random fluctuations in the training data, rather than the underlying patterns or relationships. Regularization techniques add a penalty term to the model's objective function, which discourages the model from becoming too complex and helps it generalize better to new, unseen data. This improves the model's ability to make accurate predictions on new data by reducing the variance and increasing the model's overall performance.")]
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to memorize the training data instead of learning general patterns and relationships. This leads to poor performance on new, unseen data.\n\nRegularization techniques introduce additional constraints or penalties to the model during training, discouraging it from becoming overly complex. This helps to strike a balance between fitting the training data well and generalizing to new data. Regularization techniques can include adding a penalty term to the loss function, such as L1 or L2 regularization, or using techniques like dropout or early stopping. By regularizing the model, it encourages it to learn the most relevant features and reduce the impact of noise or outliers in the data.')
```

```python
async for chunk in chat.astream(messages):
    print(chunk.content, end="", flush=True)
```

```output
The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to memorize the training data instead of learning the underlying patterns. Regularization techniques help in reducing the complexity of the model by adding a penalty to the loss function. This penalty encourages the model to have smaller weights or fewer features, making it more generalized and less prone to overfitting. The goal is to find the right balance between fitting the training data well and being able to generalize well to unseen data.
```

```python
async for chunk in chat.astream_log(messages):
    print(chunk)
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '754c4143-2348-46c4-ad2b-3095913084c6',
            'logs': {},
            'streamed_output': []}})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='The')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' purpose')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' regularization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' is')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' prevent')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' machine')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' learning')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' from')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' training')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' improve')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' its')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' general')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' ability')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' Over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' occurs')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' when')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' becomes')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' too')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complex')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' learns')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' noise')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' or')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' random')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' fluctuations')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' in')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' training')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' instead')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' capturing')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' underlying')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' patterns')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' relationships')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' Regular')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' techniques')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' introduce')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' penalty')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' term')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content="'s")})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' objective')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' function')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' which')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' discour')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ages')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' from')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' becoming')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' too')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complex')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' This')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' helps')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' control')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content="'s")})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complexity')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' reduces')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' risk')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' leading')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' better')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' performance')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' on')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' unseen')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='')})
RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': {'generations': [[{'generation_info': {'finish_reason': 'stop'},
                              'message': AIMessageChunk(content="The purpose of model regularization is to prevent a machine learning model from overfitting the training data and improve its generalization ability. Overfitting occurs when a model becomes too complex and learns to fit the noise or random fluctuations in the training data, instead of capturing the underlying patterns and relationships. Regularization techniques introduce a penalty term to the model's objective function, which discourages the model from becoming too complex. This helps to control the model's complexity and reduces the risk of overfitting, leading to better performance on unseen data."),
                              'text': 'The purpose of model regularization is '
                                      'to prevent a machine learning model '
                                      'from overfitting the training data and '
                                      'improve its generalization ability. '
                                      'Overfitting occurs when a model becomes '
                                      'too complex and learns to fit the noise '
                                      'or random fluctuations in the training '
                                      'data, instead of capturing the '
                                      'underlying patterns and relationships. '
                                      'Regularization techniques introduce a '
                                      "penalty term to the model's objective "
                                      'function, which discourages the model '
                                      'from becoming too complex. This helps '
                                      "to control the model's complexity and "
                                      'reduces the risk of overfitting, '
                                      'leading to better performance on unseen '
                                      'data.'}]],
            'llm_output': None,
            'run': None}})
```

## [LangSmith](/docs/langsmith)

すべての`ChatModel`には組み込みのLangSmithトレースが付属しています。次の環境変数を設定するだけです：

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=<your-api-key>
```

すると、どの`ChatModel`の呼び出しも自動的にトレースされます。トレースには入力、出力、レイテンシ、トークン使用、呼び出しパラメータ、環境パラメータなどが含まれます。こちらの例を参照してください：https://smith.langchain.com/public/a54192ae-dd5c-4f7a-88d1-daa1eaba1af7/r.

LangSmithでは、その後、任意のトレースにフィードバックを提供し、評価のために注釈付きデータセットをコンパイルし、プレイグラウンドでパフォーマンスをデバッグするなどができます。

## [Legacy] `__call__`

#### メッセージ入力 -> メッセージ出力

利便性のために、チャットモデルを呼び出し可能なものとして扱うこともできます。1つ以上のメッセージをチャットモデルに渡すことで、チャットの補完を得ることができます。応答はメッセージになります。

```python
from langchain_core.messages import HumanMessage, SystemMessage

chat(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'adore la programmation.")
```

OpenAIのチャットモデルは、複数のメッセージを入力としてサポートしています。詳細は[こちら](https://platform.openai.com/docs/guides/chat/chat-vs-completions)を参照してください。システムメッセージとユーザーメッセージをチャットモデルに送信する例を以下に示します：

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]
chat(messages)
```

```output
AIMessage(content="J'adore la programmation.")
```

## [Legacy] `generate`

#### バッチ呼び出し、より豊かな出力

さらに一歩進んで、`generate`を使用して複数のメッセージセットに対して補完を生成することができます。これにより、追加の`message`パラメータを含む`LLMResult`が返されます。これには、返されたメッセージ以上の各生成に関する追加情報（例：終了理由）や、API呼び出し全体に関する追加情報（例：使用されたトークンの総数）が含まれます。

```python
batch_messages = [
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ],
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love artificial intelligence."),
    ],
]
result = chat.generate(batch_messages)
result
```

```output
LLMResult(generations=[[ChatGeneration(text="J'adore programmer.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore programmer."))], [ChatGeneration(text="J'adore l'intelligence artificielle.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore l'intelligence artificielle."))]], llm_output={'token_usage': {'prompt_tokens': 53, 'completion_tokens': 18, 'total_tokens': 71}, 'model_name': 'gpt-3.5-turbo'}, run=[RunInfo(run_id=UUID('077917a9-026c-47c4-b308-77b37c3a3bfa')), RunInfo(run_id=UUID('0a70a0bf-c599-4f51-932a-c7d42202c984'))])
```

このLLMResultからトークン使用量などを取得できます：

```python
result.llm_output
```

```output
{'token_usage': {'prompt_tokens': 53,
  'completion_tokens': 18,
  'total_tokens': 71},
 'model_name': 'gpt-3.5-turbo'}
```
